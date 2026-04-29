const test = require("node:test");
const assert = require("node:assert/strict");

const { createHttpTestContext } = require("./helpers/test-context");

const { api, login } = createHttpTestContext(test, {
  dbFileName: "exports.db",
  jwtSecret: "exports-secret"
});

test.describe("exports module", () => {
  test("returns json daily report with goals, meals and hydration summary", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const response = await api("/api/exports/daily-report", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(response.status, 200);
    assert.equal(typeof response.payload.date, "string");
    assert.equal(typeof response.payload.goals.calories, "number");
    assert.equal(typeof response.payload.hydration.totalMl, "number");
    assert.ok(Array.isArray(response.payload.meals));
  });

  test("rejects unsupported daily report formats", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const response = await api("/api/exports/daily-report?format=xml", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(response.status, 400);
    assert.equal(response.payload.error, "Export format is not supported");
  });

  test("rejects export requests with invalid dates", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const response = await api("/api/exports/daily-report?date=2026-99-99", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(response.status, 400);
  });
});
