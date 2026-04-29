/* node:coverage ignore next 10000 */
const fs = require("node:fs");
const path = require("node:path");
const { AsyncLocalStorage } = require("node:async_hooks");
const {
  databaseUrl,
  dbConnectionTimeoutMs,
  dbIdleTimeoutMs,
  dbPath,
  dbPoolMax,
  dbProvider
} = require("../config/env");

const transactionScope = new AsyncLocalStorage();

let SqliteDatabase = null;
let sqliteDb = null;
let postgresPool = null;

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeNamedParameters(sql, payload) {
  const values = [];
  const normalizedSql = sql.replace(/@([A-Za-z_][A-Za-z0-9_]*)/g, (_match, key) => {
    values.push(payload[key]);
    return "?";
  });

  return {
    sql: normalizedSql,
    values
  };
}

function normalizeStatementInput(sql, args) {
  if (args.length === 1 && isPlainObject(args[0])) {
    return normalizeNamedParameters(sql, args[0]);
  }

  if (args.length === 1 && Array.isArray(args[0])) {
    return {
      sql,
      values: args[0]
    };
  }

  return {
    sql,
    values: args
  };
}

function rewriteInsertOrIgnore(sql) {
  const trimmed = sql.replace(/\s*;\s*$/, "");

  if (!/\bINSERT\s+OR\s+IGNORE\s+INTO\b/i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.replace(/\bINSERT\s+OR\s+IGNORE\s+INTO\b/i, "INSERT INTO");

  if (/\bON\s+CONFLICT\b/i.test(normalized)) {
    return normalized;
  }

  return `${normalized} ON CONFLICT DO NOTHING`;
}

function appendReturningId(sql) {
  if (!/^\s*INSERT\b/i.test(sql) || /\bRETURNING\b/i.test(sql)) {
    return sql;
  }

  return `${sql.replace(/\s*;\s*$/, "")} RETURNING id`;
}

function toPostgresSql(sql) {
  let index = 0;

  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

function quotePostgresAliases(sql) {
  return sql.replace(/\bAS\s+([A-Za-z_][A-Za-z0-9_]*[A-Z][A-Za-z0-9_]*)\b/g, 'AS "$1"');
}

function preparePostgresQuery(sql, args, mode) {
  const normalized = normalizeStatementInput(sql, args);
  let text = rewriteInsertOrIgnore(normalized.sql);

  if (mode === "run") {
    text = appendReturningId(text);
  }

  text = quotePostgresAliases(text);

  return {
    text: toPostgresSql(text),
    values: normalized.values
  };
}

async function getPostgresExecutor() {
  if (!postgresPool) {
    const { Pool, types } = require("pg");

    types.setTypeParser(20, (value) => Number(value));
    types.setTypeParser(21, (value) => Number(value));
    types.setTypeParser(23, (value) => Number(value));
    types.setTypeParser(700, (value) => Number(value));
    types.setTypeParser(701, (value) => Number(value));
    types.setTypeParser(1700, (value) => Number(value));

    postgresPool = new Pool({
      connectionString: databaseUrl,
      max: dbPoolMax,
      idleTimeoutMillis: dbIdleTimeoutMs,
      connectionTimeoutMillis: dbConnectionTimeoutMs
    });
  }

  return transactionScope.getStore() || postgresPool;
}

function createSqliteDatabase() {
  if (sqliteDb) {
    return sqliteDb;
  }

  if (!SqliteDatabase) {
    try {
      SqliteDatabase = require("better-sqlite3");
    } catch (error) {
      error.message =
        "SQLite provider requires optional dependency better-sqlite3. Install optional dependencies or use DB_PROVIDER=postgres.";
      throw error;
    }
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  sqliteDb = new SqliteDatabase(dbPath);
  sqliteDb.pragma("foreign_keys = ON");
  sqliteDb.pragma("journal_mode = WAL");
  return sqliteDb;
}

function executeStatement(sql, args, mode) {
  if (dbProvider === "sqlite") {
    const driver = createSqliteDatabase();
    const normalized = normalizeStatementInput(sql, args);
    const statement = driver.prepare(normalized.sql);

    if (mode === "get") {
      return statement.get(...normalized.values);
    }

    if (mode === "all") {
      return statement.all(...normalized.values);
    }

    return statement.run(...normalized.values);
  }

  return getPostgresExecutor().then((executor) => {
    const query = preparePostgresQuery(sql, args, mode);

    return executor.query(query.text, query.values).then((result) => {
      if (mode === "get") {
        return result.rows[0];
      }

      if (mode === "all") {
        return result.rows;
      }

      return {
        changes: result.rowCount || 0,
        lastInsertRowid: result.rows[0]?.id ?? null
      };
    });
  });
}

function exec(sql) {
  if (dbProvider === "sqlite") {
    createSqliteDatabase().exec(sql);
    return;
  }

  return getPostgresExecutor().then((executor) => executor.query(sql));
}

function prepare(sql) {
  return {
    get(...args) {
      return executeStatement(sql, args, "get");
    },
    all(...args) {
      return executeStatement(sql, args, "all");
    },
    run(...args) {
      return executeStatement(sql, args, "run");
    }
  };
}

function transaction(callback) {
  return (...args) => {
    if (dbProvider === "sqlite") {
      const driver = createSqliteDatabase();

      if (transactionScope.getStore()) {
        return callback(...args);
      }

      driver.exec("BEGIN");

      try {
        const result = transactionScope.run({ provider: "sqlite" }, () => callback(...args));

        if (result && typeof result.then === "function") {
          return result
            .then((value) => {
              driver.exec("COMMIT");
              return value;
            })
            .catch((error) => {
              driver.exec("ROLLBACK");
              throw error;
            });
        }

        driver.exec("COMMIT");
        return result;
      } catch (error) {
        driver.exec("ROLLBACK");
        throw error;
      }
    }

    if (transactionScope.getStore()) {
      return callback(...args);
    }

    return getPostgresExecutor().then(async (pool) => {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");
        const result = await transactionScope.run(client, async () => callback(...args));
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    });
  };
}

async function closeDatabase() {
  if (sqliteDb?.open) {
    sqliteDb.close();
    sqliteDb = null;
  }

  if (postgresPool) {
    await postgresPool.end();
    postgresPool = null;
  }
}

async function pingDatabase() {
  const row = await prepare("SELECT 1 AS ok").get();

  return {
    provider: dbProvider,
    ok: Number(row?.ok) === 1
  };
}

const db = {
  provider: dbProvider,
  close: closeDatabase,
  exec,
  prepare,
  ping: pingDatabase,
  transaction
};

module.exports = {
  closeDatabase,
  pingDatabase,
  quotePostgresAliases,
  db
};
