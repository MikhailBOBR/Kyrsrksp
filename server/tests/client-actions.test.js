const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { readClientArtifacts } = require("../../scripts/lib/client-contracts");

const rootDir = path.resolve(__dirname, "..", "..");
const artifacts = readClientArtifacts(rootDir);

test.describe("frontend interaction coverage", () => {
  test("keeps drawer navigation views in markup", () => {
    [
      "overview",
      "comparison",
      "controls",
      "wellbeing",
      "day-note",
      "planner",
      "week",
      "recipes",
      "favorites",
      "journal",
      "catalog",
      "shopping",
      "exchange"
    ].forEach((view) => {
      assert.match(artifacts.indexHtml, new RegExp(`data-view="${view}"`));
    });
  });

  test("wires static toolbar, drawer and import actions", () => {
    [
      /sidebarToggleButton\?\.addEventListener/,
      /sidebarCloseButton\?\.addEventListener/,
      /sidebarBackdrop\?\.addEventListener/,
      /navigationLinks\.forEach/,
      /quickViewButtons\.forEach/,
      /exportJsonButton\.addEventListener/,
      /exportPdfButton\.addEventListener/,
      /downloadImportTemplateButton\?\.addEventListener/,
      /importForm\?\.addEventListener/,
      /importApplyButton\?\.addEventListener/,
      /quickWaterButtons\.forEach/,
      /previousDateButton\.addEventListener/,
      /refreshButton\.addEventListener/
    ].forEach((pattern) => {
      assert.match(artifacts.appJs, pattern);
    });
  });

  test("keeps dynamic card actions connected for key tabs", () => {
    [
      /\.template-plan-button[\s\S]{0,120}addEventListener/,
      /\.recipe-plan-button[\s\S]{0,120}addEventListener/,
      /\.product-fill-button[\s\S]{0,120}addEventListener/,
      /\.product-shopping-button[\s\S]{0,120}addEventListener/,
      /\.save-template-button[\s\S]{0,120}addEventListener/,
      /\.save-plan-button[\s\S]{0,120}addEventListener/,
      /\.planner-toggle-button[\s\S]{0,120}addEventListener/,
      /\.shopping-check-button[\s\S]{0,120}addEventListener/,
      /\.favorite-template-plan[\s\S]{0,120}addEventListener/,
      /refreshPlannerViews\(\)/
    ].forEach((pattern) => {
      assert.match(artifacts.appJs, pattern);
    });
  });

  test("keeps hidden drawer layers non-interactive", () => {
    [
      /\.sidebar-backdrop\s*\{/,
      /\.sidebar-backdrop\.is-visible\s*\{/,
      /\.workspace-sidebar\s*\{/,
      /body\.drawer-open \.workspace-sidebar\s*\{/,
      /pointer-events:\s*none/,
      /visibility:\s*hidden/,
      /\.workspace-main\s*\{/,
      /\[data-view-panel\] button/
    ].forEach((pattern) => {
      assert.match(artifacts.stylesCss, pattern);
    });
  });
});
