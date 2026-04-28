const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { openApiDocument } = require("../src/modules/docs/openapi");
const { swaggerUiOptions } = require("../src/modules/docs/swagger-ui");

const PUBLIC_OPERATIONS = new Set([
  "get /api/health",
  "get /api/live",
  "get /api/ready",
  "post /api/auth/register",
  "post /api/auth/login",
  "get /api/products"
]);

function listOperations() {
  return Object.entries(openApiDocument.paths).flatMap(([pathname, pathItem]) =>
    Object.entries(pathItem)
      .filter(([method]) => ["get", "post", "put", "patch", "delete"].includes(method))
      .map(([method, operation]) => ({
        key: `${method} ${pathname}`,
        method,
        pathname,
        operation
      }))
  );
}

test.describe("openapi and documentation quality", () => {
  test("keeps the branded Swagger document readable and complete", () => {
    const serialized = JSON.stringify(openApiDocument);

    assert.equal(openApiDocument.openapi, "3.0.3");
    assert.equal(openApiDocument.info.title, "Рацион API");
    assert.match(openApiDocument.info.description, /Персональный дневник питания/);
    assert.doesNotMatch(serialized, /Р Р°|РљР‘|СЃС‚|РџРµ/);
    assert.ok(openApiDocument.tags.length >= 15);
    assert.ok(Object.keys(openApiDocument.paths).length >= 40);
    assert.equal(openApiDocument.components.securitySchemes.bearerAuth.scheme, "bearer");
  });

  test("documents every operation with tags, operationId, success and error responses", () => {
    const operations = listOperations();

    assert.ok(operations.length >= 45);

    operations.forEach(({ key, operation }) => {
      assert.ok(operation.operationId, `${key} should have operationId`);
      assert.ok(Array.isArray(operation.tags) && operation.tags.length > 0, `${key} should have tags`);
      assert.ok(operation.summary, `${key} should have summary`);
      assert.ok(operation.responses, `${key} should have responses`);
      assert.ok(
        Object.keys(operation.responses).some((status) => /^2\d\d$/.test(status)),
        `${key} should document a 2xx response`
      );
      assert.ok(operation.responses[500], `${key} should document 500 response`);
    });
  });

  test("keeps path parameters and protected routes explicit", () => {
    listOperations().forEach(({ key, pathname, operation }) => {
      const pathParams = [...pathname.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);

      pathParams.forEach((name) => {
        assert.ok(
          (operation.parameters || []).some(
            (parameter) => parameter.in === "path" && parameter.name === name && parameter.required === true
          ),
          `${key} should document path parameter ${name}`
        );
      });

      if (!PUBLIC_OPERATIONS.has(key)) {
        assert.deepEqual(operation.security, [{ bearerAuth: [] }], `${key} should require bearer auth`);
        assert.ok(operation.responses[401], `${key} should document unauthorized response`);
      }
    });
  });

  test("keeps Swagger UI styled for the project and useful for manual checks", () => {
    assert.equal(swaggerUiOptions.customSiteTitle, "Рацион API | Документация");
    assert.match(swaggerUiOptions.customCss, /topbar/);
    assert.match(swaggerUiOptions.customCss, /opblock-summary-path/);
    assert.equal(swaggerUiOptions.swaggerOptions.deepLinking, true);
    assert.equal(swaggerUiOptions.swaggerOptions.displayRequestDuration, true);
    assert.equal(swaggerUiOptions.swaggerOptions.persistAuthorization, true);
    assert.equal(swaggerUiOptions.swaggerOptions.tryItOutEnabled, true);
  });

  test("keeps README, API docs and wiki linked to the current project surface", () => {
    const root = path.resolve(__dirname, "../..");
    const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
    const apiDoc = fs.readFileSync(path.join(root, "docs/03-api-draft.md"), "utf8");
    const swaggerDoc = fs.readFileSync(path.join(root, "docs/10-swagger-and-api-quality.md"), "utf8");
    const wikiApi = fs.readFileSync(path.join(root, "wiki/API.md"), "utf8");

    assert.match(readme, /PostgreSQL/);
    assert.match(readme, /\/api\/docs/);
    assert.match(readme, /docs\/10-swagger-and-api-quality\.md/);
    assert.match(apiDoc, /\/api\/imports\/preview/);
    assert.match(apiDoc, /\/api\/planner\/generate-week/);
    assert.match(swaggerDoc, /OpenAPI/);
    assert.match(swaggerDoc, /Swagger UI/);
    assert.match(wikiApi, /docs\/10-swagger-and-api-quality\.md/);
  });
});
