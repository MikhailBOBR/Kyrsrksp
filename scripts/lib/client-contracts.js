const fs = require("node:fs");
const path = require("node:path");

function readClientArtifacts(rootDir) {
  return {
    appJs: fs.readFileSync(path.join(rootDir, "client", "app.js"), "utf8"),
    indexHtml: fs.readFileSync(path.join(rootDir, "client", "index.html"), "utf8"),
    stylesCss: fs.readFileSync(path.join(rootDir, "client", "styles.css"), "utf8")
  };
}

function assertClientContracts({ appJs, assert, indexHtml, stylesCss }) {
  const requiredHtmlContracts = [
    /id="app-shell"/,
    /id="theme-toggle"/,
    /id="session-badge"/,
    /id="export-json-button"/,
    /id="export-csv-button"/,
    /id="export-pdf-button"/,
    /class="sidebar-card sidebar-nav"/
  ];

  requiredHtmlContracts.forEach((pattern) => {
    assert.match(indexHtml, pattern);
  });

  const requiredStyleContracts = [
    /\.sidebar-nav\s*\{/,
    /--sticky-top-offset:/,
    /position:\s*sticky/,
    /overflow-wrap:\s*anywhere/,
    /body\[data-theme="dark"\]/,
    /\.topbar-chip-status/,
    /\.sidebar-link\.is-current/,
    /\.hero-copy-visual/
  ];

  requiredStyleContracts.forEach((pattern) => {
    assert.match(stylesCss, pattern);
  });

  assert.doesNotThrow(() => new Function(appJs));
  assert.match(appJs, /function syncLayoutMetrics/);
  assert.match(appJs, /function updateActiveSectionLink/);
  assert.match(appJs, /function buildPrintableReportMarkup/);
  assert.match(appJs, /function openPrintableReport/);
  assert.match(appJs, /exportPdfButton\.addEventListener/);
}

module.exports = {
  assertClientContracts,
  readClientArtifacts
};
