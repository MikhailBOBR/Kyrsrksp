const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  assertClientContracts,
  readClientArtifacts
} = require("../../scripts/lib/client-contracts");

const rootDir = path.resolve(__dirname, "..", "..");
const artifacts = readClientArtifacts(rootDir);

test.describe("frontend static contracts", () => {
  test("keeps critical app shell controls available", () => {
    assert.match(artifacts.indexHtml, /id="app-shell"/);
    assert.match(artifacts.indexHtml, /id="session-badge"/);
    assert.match(artifacts.indexHtml, /id="export-pdf-button"/);
    assert.match(artifacts.indexHtml, /id="visuals-panel"/);
    assert.match(artifacts.indexHtml, /id="imports-panel"/);
  });

  test("keeps navigation and theme style rules in place", () => {
    assert.match(artifacts.stylesCss, /\.sidebar-nav\s*\{/);
    assert.match(artifacts.stylesCss, /body\[data-theme="dark"\]/);
    assert.match(artifacts.stylesCss, /overflow-wrap:\s*anywhere/);
    assert.match(artifacts.stylesCss, /\.chart-surface/);
    assert.match(artifacts.stylesCss, /\.import-toolbar/);
  });

  test("keeps client javascript valid and export flow wired", () => {
    assert.doesNotThrow(() => new Function(artifacts.appJs));
    assert.match(artifacts.appJs, /function openPrintableReport/);
    assert.match(artifacts.appJs, /exportPdfButton\.addEventListener/);
    assert.match(artifacts.appJs, /function renderVisualizations/);
    assert.match(artifacts.appJs, /importForm\?\.addEventListener/);
    assert.match(artifacts.appJs, /function getStorageLabel/);
    assert.match(artifacts.appJs, /Promise\.allSettled/);
    assert.match(artifacts.appJs, /function renderWorkspaceLoadError/);
    assert.doesNotMatch(
      artifacts.appJs,
      /heroStorage\.textContent\s*=\s*"Хранилище: SQLite-база данных"/
    );
  });

  test("passes the shared client contract suite", () => {
    assertClientContracts({
      ...artifacts,
      assert
    });
  });
});
