const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "../../..");
const packageJson = require(path.join(rootDir, "package.json"));

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function parseNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseYamlValue(rawValue) {
  const value = rawValue.trim();

  if (!value.length) {
    return "";
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if (value === "true" || value === "false") {
    return value === "true";
  }

  const numeric = Number(value);

  if (!Number.isNaN(numeric) && value !== "") {
    return numeric;
  }

  return value;
}

function parseSimpleYaml(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return {};
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const result = {};

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      return;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);

    if (!key) {
      return;
    }

    result[key] = parseYamlValue(value);
  });

  return result;
}

function resolveConfigFile() {
  const explicitFile = process.env.CONFIG_FILE;

  if (explicitFile) {
    return path.isAbsolute(explicitFile) ? explicitFile : path.join(rootDir, explicitFile);
  }

  const defaultFile = path.join(rootDir, "config", "local.yaml");
  return fs.existsSync(defaultFile) ? defaultFile : "";
}

function buildDatabaseUrl(raw) {
  if (raw.DATABASE_URL) {
    return raw.DATABASE_URL;
  }

  if (raw.DB_PROVIDER !== "postgres") {
    return "";
  }

  return `postgres://${encodeURIComponent(raw.DB_USER)}:${encodeURIComponent(raw.DB_PASSWORD)}@${raw.DB_HOST}:${raw.DB_PORT}/${raw.DB_NAME}`;
}

function createConfig() {
  const configFile = resolveConfigFile();
  const fileConfig = parseSimpleYaml(configFile);
  const defaultAppEnv = process.env.NODE_ENV || "development";

  const defaults = {
    APP_ENV: defaultAppEnv,
    SERVICE_NAME: "food-diary-app",
    RELEASE_VERSION: packageJson.version,
    SERVER_HOST: "0.0.0.0",
    SERVER_PORT: 8080,
    JWT_SECRET: "super-secret-dev-key",
    DB_PROVIDER: "sqlite",
    DB_PATH: path.join(rootDir, "server", "data", "app.db"),
    DATABASE_URL: "",
    DB_HOST: "postgres",
    DB_PORT: 5432,
    DB_NAME: "nutritrack",
    DB_USER: "nutritrack",
    DB_PASSWORD: "nutritrack",
    REDIS_URL: "redis://redis:6379",
    CLIENT_ROOT: path.join(rootDir, "client"),
    LOG_LEVEL: defaultAppEnv === "test" ? "error" : "info",
    LOG_PRETTY: false,
    SHUTDOWN_TIMEOUT_MS: 10000,
    REQUEST_ID_HEADER: "X-Request-ID",
    AUTO_MIGRATE_ON_BOOT: defaultAppEnv !== "production",
    SEED_DEMO_DATA: defaultAppEnv !== "production",
    DEMO_USER_EMAIL: "demo@nutritrack.local",
    DEMO_USER_PASSWORD: "Demo123!",
    DEMO_USER_NAME: "Demo User",
    ADMIN_USER_EMAIL: "admin@nutritrack.local",
    ADMIN_USER_PASSWORD: "Admin123!",
    ADMIN_USER_NAME: "System Admin"
  };

  const merged = { ...defaults, ...fileConfig, ...process.env };
  const dbProvider = String(merged.DB_PROVIDER || "sqlite").trim().toLowerCase();

  return {
    rootDir,
    configFile,
    appEnv: String(merged.APP_ENV || defaults.APP_ENV),
    serviceName: String(merged.SERVICE_NAME || defaults.SERVICE_NAME),
    releaseVersion: String(merged.RELEASE_VERSION || defaults.RELEASE_VERSION),
    host: String(merged.SERVER_HOST || defaults.SERVER_HOST),
    port: parseNumber(merged.SERVER_PORT, defaults.SERVER_PORT),
    jwtSecret: String(merged.JWT_SECRET || defaults.JWT_SECRET),
    dbProvider,
    dbPath: String(merged.DB_PATH || defaults.DB_PATH),
    dbHost: String(merged.DB_HOST || defaults.DB_HOST),
    dbPort: parseNumber(merged.DB_PORT, defaults.DB_PORT),
    dbName: String(merged.DB_NAME || defaults.DB_NAME),
    dbUser: String(merged.DB_USER || defaults.DB_USER),
    dbPassword: String(merged.DB_PASSWORD || defaults.DB_PASSWORD),
    databaseUrl: buildDatabaseUrl({
      DATABASE_URL: merged.DATABASE_URL,
      DB_PROVIDER: dbProvider,
      DB_USER: String(merged.DB_USER || defaults.DB_USER),
      DB_PASSWORD: String(merged.DB_PASSWORD || defaults.DB_PASSWORD),
      DB_HOST: String(merged.DB_HOST || defaults.DB_HOST),
      DB_PORT: parseNumber(merged.DB_PORT, defaults.DB_PORT),
      DB_NAME: String(merged.DB_NAME || defaults.DB_NAME)
    }),
    redisUrl: String(merged.REDIS_URL || defaults.REDIS_URL),
    clientRoot: String(merged.CLIENT_ROOT || defaults.CLIENT_ROOT),
    logLevel: String(merged.LOG_LEVEL || defaults.LOG_LEVEL).toLowerCase(),
    logPretty: parseBoolean(merged.LOG_PRETTY, defaults.LOG_PRETTY),
    shutdownTimeoutMs: parseNumber(merged.SHUTDOWN_TIMEOUT_MS, defaults.SHUTDOWN_TIMEOUT_MS),
    requestIdHeader: String(merged.REQUEST_ID_HEADER || defaults.REQUEST_ID_HEADER),
    autoMigrateOnBoot: parseBoolean(merged.AUTO_MIGRATE_ON_BOOT, defaults.AUTO_MIGRATE_ON_BOOT),
    seedDemoData: parseBoolean(merged.SEED_DEMO_DATA, defaults.SEED_DEMO_DATA),
    demoUser: {
      email: String(merged.DEMO_USER_EMAIL || defaults.DEMO_USER_EMAIL),
      password: String(merged.DEMO_USER_PASSWORD || defaults.DEMO_USER_PASSWORD),
      name: String(merged.DEMO_USER_NAME || defaults.DEMO_USER_NAME)
    },
    adminUser: {
      email: String(merged.ADMIN_USER_EMAIL || defaults.ADMIN_USER_EMAIL),
      password: String(merged.ADMIN_USER_PASSWORD || defaults.ADMIN_USER_PASSWORD),
      name: String(merged.ADMIN_USER_NAME || defaults.ADMIN_USER_NAME)
    }
  };
}

const config = createConfig();

module.exports = {
  ...config,
  config,
  createConfig,
  getConfig() {
    return config;
  }
};
