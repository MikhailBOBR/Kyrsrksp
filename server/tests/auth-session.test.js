const test = require("node:test");
const assert = require("node:assert/strict");

const { createHttpTestContext } = require("./helpers/test-context");

const { api } = createHttpTestContext(test, {
  dbFileName: "auth-session.db",
  jwtSecret: "auth-session-secret"
});

test.describe("auth session flows", () => {
  test("registers a user and exposes profile through /api/auth/me", async () => {
    const email = `qa-user-${Date.now()}@example.com`;
    const registered = await api("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        name: "QA Session User",
        password: "Password123!"
      })
    });

    assert.equal(registered.status, 201);
    assert.ok(registered.payload.token);
    assert.equal(registered.payload.user.role, "user");

    const me = await api("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${registered.payload.token}`
      }
    });

    assert.equal(me.status, 200);
    assert.equal(me.payload.user.email, email);
    assert.equal(me.payload.user.name, "QA Session User");
  });

  test("rejects duplicate registration for the same email", async () => {
    const email = `dup-${Date.now()}@example.com`;

    const first = await api("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        name: "Duplicate User",
        password: "Password123!"
      })
    });

    const duplicate = await api("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        name: "Duplicate User",
        password: "Password123!"
      })
    });

    assert.equal(first.status, 201);
    assert.equal(duplicate.status, 409);
    assert.match(duplicate.payload.error, /already exists/i);
  });

  test("returns admin role in the current session profile", async () => {
    const login = await api("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "admin@nutritrack.local",
        password: "Admin123!"
      })
    });

    assert.equal(login.status, 200);
    assert.equal(login.payload.user.role, "admin");

    const me = await api("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${login.payload.token}`
      }
    });

    assert.equal(me.status, 200);
    assert.equal(me.payload.user.role, "admin");
  });
});
