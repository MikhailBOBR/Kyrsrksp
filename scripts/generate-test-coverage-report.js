const path = require("node:path");

const { writeSurfaceCoverageReport } = require("./lib/test-surface-coverage");

const rootDir = path.resolve(__dirname, "..");
const report = writeSurfaceCoverageReport(rootDir);

report.summary.forEach((item) => {
  console.log(`${item.surface}: ${item.covered}/${item.total} (${item.percent.toFixed(2)}%)`);
});

console.log("surface-coverage-ok");
