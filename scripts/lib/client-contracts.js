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
    /id="sidebar-toggle"/,
    /id="sidebar-backdrop"/,
    /id="export-json-button"/,
    /id="export-csv-button"/,
    /id="export-pdf-button"/,
    /class="sidebar-card sidebar-nav"/,
    /data-view="overview"/,
    /id="visuals-panel"/,
    /id="imports-panel"/,
    /id="import-form"/
  ];

  requiredHtmlContracts.forEach((pattern) => {
    assert.match(indexHtml, pattern);
  });

  const requiredStyleContracts = [
    /\.sidebar-nav\s*\{/,
    /--sticky-top-offset:/,
    /--drawer-width:/,
    /position:\s*sticky/,
    /visibility:\s*hidden/,
    /isolation:\s*isolate/,
    /overflow-wrap:\s*anywhere/,
    /body\[data-theme="dark"\]/,
    /\.sidebar-backdrop/,
    /\.view-panel-hidden/,
    /\.visuals-grid/,
    /\.chart-surface/,
    /\.import-toolbar/,
    /\.topbar-chip-status/,
    /\.sidebar-link\.is-current/,
    /\.hero-copy-visual/
  ];

  requiredStyleContracts.forEach((pattern) => {
    assert.match(stylesCss, pattern);
  });

  assert.doesNotThrow(() => new Function(appJs));
  assert.match(appJs, /function syncLayoutMetrics/);
  assert.match(appJs, /function syncDrawerMode/);
  assert.match(appJs, /function setActiveView/);
  assert.match(appJs, /function updateActiveSectionLink/);
  assert.match(appJs, /function renderVisualizations/);
  assert.match(appJs, /function renderImportPreview/);
  assert.match(appJs, /function refreshPlannerViews/);
  assert.match(appJs, /function downloadImportTemplate/);
  assert.match(appJs, /function buildPrintableReportMarkup/);
  assert.match(appJs, /function openPrintableReport/);
  assert.match(appJs, /registerViewPanels\(\)/);
  assert.match(appJs, /exportPdfButton\.addEventListener/);
  assert.match(appJs, /navigationLinks\.forEach/);
  assert.match(appJs, /quickWaterButtons\.forEach/);
}

module.exports = {
  assertClientContracts,
  readClientArtifacts
};
