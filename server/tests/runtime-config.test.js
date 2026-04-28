const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createConfig } = require("../src/config/env");
const { quotePostgresAliases } = require("../src/db/connection");
const { createLogEntry } = require("../src/lib/logger");

function withEnvironment(overrides, callback) {
  const snapshot = {};

  Object.keys(overrides).forEach((key) => {
    snapshot[key] = process.env[key];
    const value = overrides[key];

    if (value === undefined) {
      delete process.env[key];
      return;
    }

    process.env[key] = value;
  });

  try {
    callback();
  } finally {
    Object.keys(overrides).forEach((key) => {
      if (snapshot[key] === undefined) {
        delete process.env[key];
        return;
      }

      process.env[key] = snapshot[key];
    });
  }
}

test("config prefers environment variables over yaml file values", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "nutritrack-config-"));
  const configFile = path.join(tempDir, "local.yaml");

  fs.writeFileSync(
    configFile,
    [
      "SERVER_PORT: 5050",
      "DB_PROVIDER: sqlite",
      "DB_PATH: ./server/data/from-yaml.db",
      "LOG_LEVEL: warn"
    ].join("\n"),
    "utf8"
  );

  withEnvironment(
    {
      CONFIG_FILE: configFile,
      DB_PATH: undefined,
      SERVER_PORT: "6060",
      LOG_LEVEL: "error"
    },
    () => {
      const config = createConfig();

      assert.equal(config.port, 6060);
      assert.equal(config.logLevel, "error");
      assert.match(config.dbPath, /from-yaml\.db$/);
      assert.equal(config.configFile, configFile);
    }
  );
});

test("config accepts standard platform host and port aliases", () => {
  withEnvironment(
    {
      APP_ENV: "test",
      CONFIG_FILE: undefined,
      HOST: "127.0.0.1",
      PORT: "7070",
      SERVER_HOST: undefined,
      SERVER_PORT: undefined,
      JWT_SECRET: "alias-secret"
    },
    () => {
      const config = createConfig();

      assert.equal(config.host, "127.0.0.1");
      assert.equal(config.port, 7070);
    }
  );
});

test("config exposes runtime and backing service tuning from the environment", () => {
  withEnvironment(
    {
      APP_ENV: "test",
      CONFIG_FILE: undefined,
      DB_POOL_MAX: "24",
      DB_IDLE_TIMEOUT_MS: "45000",
      DB_CONNECTION_TIMEOUT_MS: "7000",
      SERVER_REQUEST_TIMEOUT_MS: "250000",
      SERVER_HEADERS_TIMEOUT_MS: "55000",
      SERVER_KEEP_ALIVE_TIMEOUT_MS: "6000",
      TRUST_PROXY: "true",
      JWT_SECRET: "runtime-secret"
    },
    () => {
      const config = createConfig();

      assert.equal(config.dbPoolMax, 24);
      assert.equal(config.dbIdleTimeoutMs, 45000);
      assert.equal(config.dbConnectionTimeoutMs, 7000);
      assert.equal(config.serverRequestTimeoutMs, 250000);
      assert.equal(config.serverHeadersTimeoutMs, 55000);
      assert.equal(config.serverKeepAliveTimeoutMs, 6000);
      assert.equal(config.trustProxy, true);
    }
  );
});

test("production config rejects default JWT secrets", () => {
  withEnvironment(
    {
      APP_ENV: "production",
      CONFIG_FILE: undefined,
      JWT_SECRET: undefined
    },
    () => {
      assert.throws(() => createConfig(), /JWT_SECRET/);
    }
  );
});

test("structured logger serializes error payloads", () => {
  const entry = createLogEntry("error", "runtime.failed", {
    requestId: "req-123",
    error: new Error("boom")
  });

  assert.equal(entry.level, "error");
  assert.equal(entry.message, "runtime.failed");
  assert.equal(entry.requestId, "req-123");
  assert.equal(entry.error.message, "boom");
  assert.match(entry.timestamp, /\d{4}-\d{2}-\d{2}T/);
});

test("postgres query adapter preserves mixed-case response aliases", () => {
  const sql = quotePostgresAliases(`
    SELECT
      amount_ml AS amountMl,
      logged_at AS loggedAt,
      COUNT(*) AS count
    FROM hydration_logs
  `);

  assert.match(sql, /amount_ml AS "amountMl"/);
  assert.match(sql, /logged_at AS "loggedAt"/);
  assert.match(sql, /COUNT\(\*\) AS count/);
});
