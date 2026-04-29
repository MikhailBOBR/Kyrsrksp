const test = require("node:test");
const assert = require("node:assert/strict");

const { createHttpTestContext } = require("./helpers/test-context");
const packageJson = require("../../package.json");

const { api } = createHttpTestContext(test, {
  dbFileName: "observability.db",
  jwtSecret: "observability-secret"
});
const { setDraining } = require("../src/runtime/state");

test.describe("observability and runtime metadata", () => {
  test.after(() => {
    setDraining(false);
  });

  test("health endpoint returns release metadata and request id header", async () => {
    const response = await api("/api/health");

    assert.equal(response.status, 200);
    assert.equal(response.payload.status, "ok");
    assert.equal(response.payload.ready, true);
    assert.equal(response.payload.service, "food-diary-app");
    assert.equal(response.payload.version, packageJson.version);
    assert.match(String(response.headers.get("x-request-id")), /.+/);
  });

  test("liveness and readiness endpoints separate process and backing-service checks", async () => {
    const live = await api("/api/live");
    const ready = await api("/api/ready");

    assert.equal(live.status, 200);
    assert.equal(live.payload.alive, true);
    assert.equal(live.payload.status, "ok");

    assert.equal(ready.status, 200);
    assert.equal(ready.payload.ready, true);
    assert.equal(ready.payload.checks.database.provider, "sqlite");
    assert.equal(ready.payload.checks.database.status, "ok");
  });

  test("echoes incoming request id and returns it on 404", async () => {
    const response = await api("/api/unknown-route", {
      headers: {
        "X-Request-ID": "manual-request-id-42"
      }
    });

    assert.equal(response.status, 404);
    assert.equal(response.payload.requestId, "manual-request-id-42");
    assert.equal(response.headers.get("x-request-id"), "manual-request-id-42");
  });

  test("rejects new requests while runtime is draining", async () => {
    setDraining(true);

    const health = await api("/api/health");
    const blocked = await api("/api/products");

    assert.equal(health.status, 200);
    assert.equal(health.payload.status, "draining");
    assert.equal(health.payload.ready, false);

    const ready = await api("/api/ready");
    assert.equal(ready.status, 503);
    assert.equal(ready.payload.status, "draining");
    assert.equal(ready.payload.ready, false);

    assert.equal(blocked.status, 503);
    assert.equal(blocked.payload.error, "Service is shutting down");
    assert.match(String(blocked.payload.requestId), /.+/);

    setDraining(false);
  });
});
