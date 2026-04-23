const { getConfig } = require("../config/env");

const levelWeights = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function normalizeLevel(level) {
  const normalized = String(level || "info").toLowerCase();
  return levelWeights[normalized] ? normalized : "info";
}

function serializeError(error) {
  if (!error) {
    return undefined;
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack
  };
}

function createLogEntry(level, message, context = {}, bindings = {}) {
  const config = getConfig();
  const entry = {
    timestamp: new Date().toISOString(),
    level: normalizeLevel(level),
    service: config.serviceName,
    environment: config.appEnv,
    release: config.releaseVersion,
    message,
    ...bindings,
    ...context
  };

  if (entry.error instanceof Error) {
    entry.error = serializeError(entry.error);
  }

  return entry;
}

function shouldWrite(level) {
  const config = getConfig();
  const activeLevel = normalizeLevel(config.logLevel);
  return levelWeights[normalizeLevel(level)] >= levelWeights[activeLevel];
}

function writeLog(level, entry) {
  if (!shouldWrite(level)) {
    return;
  }

  const stream = normalizeLevel(level) === "error" ? process.stderr : process.stdout;
  stream.write(`${JSON.stringify(entry)}\n`);
}

function createLogger(bindings = {}) {
  return {
    child(extraBindings = {}) {
      return createLogger({ ...bindings, ...extraBindings });
    },
    debug(message, context) {
      writeLog("debug", createLogEntry("debug", message, context, bindings));
    },
    info(message, context) {
      writeLog("info", createLogEntry("info", message, context, bindings));
    },
    warn(message, context) {
      writeLog("warn", createLogEntry("warn", message, context, bindings));
    },
    error(message, context) {
      writeLog("error", createLogEntry("error", message, context, bindings));
    }
  };
}

const logger = createLogger();

module.exports = {
  createLogEntry,
  createLogger,
  logger,
  normalizeLevel,
  serializeError
};
