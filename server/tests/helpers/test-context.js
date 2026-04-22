const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function createHttpTestContext(test, { dbFileName, jwtSecret = "test-secret" }) {
  const dbPath = path.resolve(__dirname, "../../data", dbFileName);

  process.env.DB_PATH = dbPath;
  process.env.JWT_SECRET = jwtSecret;

  const dbFiles = [dbPath, `${dbPath}-wal`, `${dbPath}-shm`];

  dbFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  const { initializeDatabase } = require("../../src/db/init-schema");
  const { createApp } = require("../../src/app");
  const { db } = require("../../src/db/connection");

  let server;
  let baseUrl = "";

  test.before(async () => {
    initializeDatabase();

    const app = createApp();

    server = await new Promise((resolve) => {
      const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    });

    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  test.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();

    dbFiles.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  async function api(pathname, options = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, options);
    const payload = await response.json().catch(() => ({}));

    return {
      status: response.status,
      payload,
      headers: response.headers
    };
  }

  async function text(pathname, options = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, options);
    const payload = await response.text();

    return {
      status: response.status,
      payload,
      headers: response.headers
    };
  }

  async function login(email, password) {
    const response = await api("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    assert.equal(response.status, 200);
    return response.payload.token;
  }

  return {
    api,
    text,
    login
  };
}

module.exports = {
  createHttpTestContext
};
