const test = require("node:test");
const assert = require("node:assert/strict");

const { createHttpTestContext } = require("./helpers/test-context");

const { api, login } = createHttpTestContext(test, {
  dbFileName: "users.db",
  jwtSecret: "users-secret"
});

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function registerUser(email, name = "Role Target") {
  const response = await api("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      name,
      password: "Password123!"
    })
  });

  assert.equal(response.status, 201);
  return response.payload;
}

test.describe("admin user role management", () => {
  test("allows admin to list users and promote a regular user", async () => {
    const adminToken = await login("admin@nutritrack.local", "Admin123!");
    const registered = await registerUser(uniqueEmail("role-target"));

    const users = await api("/api/users", {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    assert.equal(users.status, 200);
    assert.ok(users.payload.some((user) => user.email === registered.user.email));
    assert.equal(users.payload.find((user) => user.email === registered.user.email).passwordHash, undefined);

    const promoted = await api(`/api/users/${registered.user.id}/role`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "admin"
      })
    });

    assert.equal(promoted.status, 200);
    assert.equal(promoted.payload.email, registered.user.email);
    assert.equal(promoted.payload.role, "admin");

    const me = await api("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${registered.token}`
      }
    });

    assert.equal(me.status, 200);
    assert.equal(me.payload.user.role, "admin");
  });

  test("prevents regular users from reading users or changing roles", async () => {
    const registered = await registerUser(uniqueEmail("blocked-role-user"), "Blocked User");

    const users = await api("/api/users", {
      headers: {
        Authorization: `Bearer ${registered.token}`
      }
    });

    assert.equal(users.status, 403);

    const promoted = await api(`/api/users/${registered.user.id}/role`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${registered.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "admin"
      })
    });

    assert.equal(promoted.status, 403);
  });

  test("validates role updates and protects the current admin role", async () => {
    const adminToken = await login("admin@nutritrack.local", "Admin123!");
    const users = await api("/api/users", {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    const admin = users.payload.find((user) => user.email === "admin@nutritrack.local");

    const invalidRole = await api(`/api/users/${admin.id}/role`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "owner"
      })
    });

    assert.equal(invalidRole.status, 400);

    const sameRole = await api(`/api/users/${admin.id}/role`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "admin"
      })
    });

    assert.equal(sameRole.status, 200);
    assert.equal(sameRole.payload.role, "admin");

    const selfDemotion = await api(`/api/users/${admin.id}/role`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "user"
      })
    });

    assert.equal(selfDemotion.status, 400);

    const invalidId = await api("/api/users/not-a-number/role", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "admin"
      })
    });

    assert.equal(invalidId.status, 400);

    const missingUser = await api("/api/users/999999/role", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "admin"
      })
    });

    assert.equal(missingUser.status, 404);
  });
});
