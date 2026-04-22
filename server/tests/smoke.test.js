const test = require("node:test");
const assert = require("node:assert/strict");

const { createHttpTestContext } = require("./helpers/test-context");

const { api, text } = createHttpTestContext(test, {
  dbFileName: "smoke.db",
  jwtSecret: "smoke-secret"
});

test.describe("application smoke checks", () => {
  test("serves health endpoint", async () => {
    const response = await api("/api/health");

    assert.equal(response.status, 200);
    assert.equal(response.payload.status, "ok");
    assert.match(response.payload.stack, /swagger/);
  });

  test("serves openapi and swagger ui", async () => {
    const openapi = await api("/api/openapi.json");
    const docs = await text("/api/docs");

    assert.equal(openapi.status, 200);
    assert.equal(openapi.payload.openapi, "3.0.3");
    assert.equal(openapi.payload.info.title, "Рацион API");
    assert.equal(openapi.payload.servers[0].url, "/");
    assert.equal(docs.status, 200);
    assert.match(docs.payload, /Рацион API \| Документация/i);
  });

  test("serves client html, styles and favicon", async () => {
    const page = await text("/");
    const styles = await text("/styles.css");
    const icon = await text("/favicon.svg");

    assert.equal(page.status, 200);
    assert.match(page.payload, /topbar/);
    assert.match(page.payload, /app\.js/);

    assert.equal(styles.status, 200);
    assert.match(styles.payload, /--content-width/);

    assert.equal(icon.status, 200);
    assert.match(icon.payload, /<svg/);
  });

  test("returns json 404 for unknown api route", async () => {
    const response = await api("/api/unknown-route");

    assert.equal(response.status, 404);
    assert.equal(response.payload.error, "Route not found");
  });
});
