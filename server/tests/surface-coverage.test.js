const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { evaluateSurfaceCoverage } = require("../../scripts/lib/test-surface-coverage");

const rootDir = path.resolve(__dirname, "..", "..");

test.describe("declared test surface coverage", () => {
  test("covers every API operation, server module, frontend contract and fuzz scenario", () => {
    const report = evaluateSurfaceCoverage(rootDir);

    assert.deepEqual(report.failures, []);

    report.summary.forEach((item) => {
      assert.equal(item.percent, 100, `${item.surface} should be 100% covered`);
    });
  });
});
