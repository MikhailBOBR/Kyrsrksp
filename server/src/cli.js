const {
  adminUser,
  appEnv,
  autoMigrateOnBoot,
  dbProvider,
  host,
  port,
  releaseVersion,
  seedDemoData
} = require("./config/env");
const { createApp } = require("./app");
const { closeDatabase } = require("./db/connection");
const { ensureAdminUser } = require("./db/admin-user");
const { initializeDatabase, runMigrations } = require("./db/init-schema");
const { logger } = require("./lib/logger");
const { createHttpServer } = require("./index");

function parseCliArgs(argv = process.argv.slice(2)) {
  const [command = "server", ...rest] = argv;
  const options = {};

  rest.forEach((item) => {
    if (!item.startsWith("--")) {
      return;
    }

    const [rawKey, rawValue] = item.slice(2).split("=");
    const key = rawKey.trim();

    if (!key) {
      return;
    }

    options[key] = rawValue === undefined ? true : rawValue;
  });

  return {
    command,
    options
  };
}

async function runServerCommand() {
  if (autoMigrateOnBoot) {
    initializeDatabase({ withSeedData: seedDemoData });
  } else {
    logger.info("database.bootstrap.skipped", {
      reason: "AUTO_MIGRATE_ON_BOOT=false"
    });
  }

  const app = createApp();
  const server = createHttpServer(app);

  return server;
}

function runMigrateCommand() {
  const summary = runMigrations();
  logger.info("database.migrate.completed", summary);
  closeDatabase();
  return summary;
}

function runCreateAdminCommand(options) {
  runMigrations();

  const result = ensureAdminUser({
    email: String(options.email || adminUser.email),
    password: String(options.password || adminUser.password),
    name: String(options.name || adminUser.name)
  });

  logger.info("admin-user.provisioned", {
    created: result.created,
    email: result.user.email
  });

  closeDatabase();
  return result;
}

async function runCommand(argv = process.argv.slice(2)) {
  const { command, options } = parseCliArgs(argv);

  if (command === "server") {
    logger.info("runtime.boot", {
      mode: "server",
      environment: appEnv,
      dbProvider,
      host,
      port,
      release: releaseVersion,
      autoMigrateOnBoot
    });
    return runServerCommand();
  }

  if (command === "migrate") {
    return runMigrateCommand();
  }

  if (command === "create-admin") {
    return runCreateAdminCommand(options);
  }

  throw new Error(`Unknown command: ${command}`);
}

if (require.main === module) {
  runCommand().catch((error) => {
    logger.error("cli.command.failed", { error });
    closeDatabase();
    process.exitCode = 1;
  });
}

module.exports = {
  parseCliArgs,
  runCommand
};
