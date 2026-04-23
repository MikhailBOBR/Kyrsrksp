const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createConfig } = require("../src/config/env");
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
