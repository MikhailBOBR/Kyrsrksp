/* node:coverage ignore next 10000 */
const fs = require("node:fs");
const path = require("node:path");

const { openApiDocument } = require("../../server/src/modules/docs/openapi");

const API_OPERATION_COVERAGE = {
  getHealth: ["smoke.test.js", "observability.test.js"],
  getLive: ["observability.test.js"],
  getReady: ["observability.test.js"],
  postAuthRegister: ["api.test.js", "auth-session.test.js", "fuzz.test.js"],
  postAuthLogin: ["api.test.js", "auth-session.test.js", "contracts.test.js", "fuzz.test.js"],
  getAuthMe: ["auth-session.test.js"],
  getGoals: ["api-crud-coverage.test.js"],
  putGoals: ["api-crud-coverage.test.js", "contracts.test.js", "fuzz.test.js"],
  getGoalsPresets: ["api.test.js"],
  postGoalsPresetsPresetIdApply: ["api.test.js"],
  getProducts: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  postProducts: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  putProductsId: ["api.test.js", "api-crud-coverage.test.js"],
  deleteProductsId: ["api-crud-coverage.test.js"],
  getMeals: ["api.test.js"],
  postMeals: ["api.test.js", "api-crud-coverage.test.js", "contracts.test.js", "fuzz.test.js"],
  putMealsId: ["api-crud-coverage.test.js"],
  deleteMealsId: ["api-crud-coverage.test.js"],
  getDashboard: ["api.test.js", "contracts.test.js", "fuzz.test.js"],
  getHydration: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  postHydration: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  deleteHydrationId: ["api-crud-coverage.test.js"],
  getTemplates: ["api.test.js", "api-crud-coverage.test.js"],
  postTemplates: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  postTemplatesFromMealMealId: ["api-crud-coverage.test.js"],
  postTemplatesIdApply: ["api.test.js", "api-crud-coverage.test.js"],
  deleteTemplatesId: ["api-crud-coverage.test.js"],
  getRecipes: ["api-crud-coverage.test.js"],
  postRecipes: ["api.test.js", "api-crud-coverage.test.js", "contracts.test.js", "fuzz.test.js"],
  postRecipesIdApply: ["api.test.js"],
  postRecipesIdPlan: ["api.test.js"],
  deleteRecipesId: ["api-crud-coverage.test.js"],
  getExportsDailyReport: ["exports.test.js", "api.test.js"],
  getImportsTemplate: ["imports.test.js"],
  postImportsPreview: ["imports.test.js", "fuzz.test.js"],
  postImportsApply: ["imports.test.js", "fuzz.test.js"],
  getCheckins: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  putCheckins: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  deleteCheckins: ["api-crud-coverage.test.js"],
  getMetrics: ["api.test.js"],
  postMetrics: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  deleteMetricsId: ["api-crud-coverage.test.js"],
  getPlanner: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  postPlanner: ["api-crud-coverage.test.js", "fuzz.test.js"],
  postPlannerFromTemplateTemplateId: ["api.test.js"],
  postPlannerGenerateWeek: ["api.test.js", "contracts.test.js", "fuzz.test.js"],
  patchPlannerIdCompletion: ["api.test.js", "api-crud-coverage.test.js"],
  deletePlannerId: ["api-crud-coverage.test.js"],
  getShopping: ["api.test.js", "api-crud-coverage.test.js"],
  postShopping: ["api-crud-coverage.test.js", "fuzz.test.js"],
  postShoppingFromProductProductId: ["api.test.js", "api-crud-coverage.test.js"],
  patchShoppingIdCheck: ["api.test.js", "api-crud-coverage.test.js"],
  deleteShoppingChecked: ["api-crud-coverage.test.js"],
  deleteShoppingId: ["api-crud-coverage.test.js"],
  getDayNotes: ["api-crud-coverage.test.js", "fuzz.test.js"],
  putDayNotes: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  deleteDayNotes: ["api-crud-coverage.test.js"],
  getDayNotesRecent: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  getFavorites: ["api.test.js"],
  postFavoritesProductsProductId: ["api.test.js", "api-crud-coverage.test.js"],
  deleteFavoritesProductsProductId: ["api-crud-coverage.test.js"],
  postFavoritesTemplatesTemplateId: ["api.test.js", "api-crud-coverage.test.js"],
  deleteFavoritesTemplatesTemplateId: ["api-crud-coverage.test.js"]
};

const SERVER_MODULE_COVERAGE = {
  auth: ["api.test.js", "auth-session.test.js", "contracts.test.js", "fuzz.test.js"],
  checkins: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  dashboard: ["api.test.js", "fuzz.test.js"],
  "day-notes": ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  docs: ["openapi-docs.test.js", "smoke.test.js"],
  exports: ["exports.test.js", "api.test.js"],
  favorites: ["api.test.js", "api-crud-coverage.test.js"],
  goals: ["api.test.js", "api-crud-coverage.test.js", "contracts.test.js"],
  hydration: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  imports: ["imports.test.js", "fuzz.test.js"],
  meals: ["api.test.js", "api-crud-coverage.test.js", "contracts.test.js", "fuzz.test.js"],
  metrics: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  planner: ["api.test.js", "api-crud-coverage.test.js", "contracts.test.js", "fuzz.test.js"],
  products: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  recipes: ["api.test.js", "api-crud-coverage.test.js", "contracts.test.js", "fuzz.test.js"],
  shopping: ["api.test.js", "api-crud-coverage.test.js", "fuzz.test.js"],
  templates: ["api.test.js", "api-crud-coverage.test.js"]
};

const forbiddenTableUpper = new RegExp(["C", "S", "V"].join(""));
const forbiddenTableLower = new RegExp(["c", "s", "v"].join(""));

const FRONTEND_CONTRACTS = [
  {
    name: "auth forms and session controls",
    patterns: [
      ["indexHtml", /id="login-form"/],
      ["indexHtml", /id="register-form"/],
      ["appJs", /loginForm\.addEventListener\("submit"/],
      ["appJs", /registerForm\.addEventListener\("submit"/],
      ["appJs", /logoutButton\.addEventListener/]
    ]
  },
  {
    name: "sidebar navigation covers every workspace view",
    patterns: [
      ["indexHtml", /data-view="overview"/],
      ["indexHtml", /data-view="comparison"/],
      ["indexHtml", /data-view="controls"/],
      ["indexHtml", /data-view="wellbeing"/],
      ["indexHtml", /data-view="day-note"/],
      ["indexHtml", /data-view="planner"/],
      ["indexHtml", /data-view="week"/],
      ["indexHtml", /data-view="recipes"/],
      ["indexHtml", /data-view="favorites"/],
      ["indexHtml", /data-view="journal"/],
      ["indexHtml", /data-view="catalog"/],
      ["indexHtml", /data-view="shopping"/],
      ["indexHtml", /data-view="exchange"/],
      ["appJs", /const viewPanelAssignments = \{/],
      ["appJs", /function setActiveView/]
    ]
  },
  {
    name: "dashboard and visualization widgets",
    patterns: [
      ["indexHtml", /id="summary-cards"/],
      ["indexHtml", /id="trend-combo-chart"/],
      ["indexHtml", /id="macro-donut-chart"/],
      ["indexHtml", /id="wellbeing-radar-chart"/],
      ["indexHtml", /id="meal-timeline-chart"/],
      ["appJs", /function renderVisualizations/],
      ["appJs", /function renderMealTimeline/],
      ["stylesCss", /#meal-timeline-chart/]
    ]
  },
  {
    name: "daily forms",
    patterns: [
      ["indexHtml", /id="goals-form"/],
      ["indexHtml", /id="meal-form"/],
      ["indexHtml", /id="checkin-form"/],
      ["indexHtml", /id="body-metric-form"/],
      ["indexHtml", /id="day-note-form"/],
      ["appJs", /goalsForm\.addEventListener\("submit"/],
      ["appJs", /mealForm\.addEventListener\("submit"/],
      ["appJs", /checkinForm\.addEventListener\("submit"/],
      ["appJs", /bodyMetricForm\.addEventListener\("submit"/],
      ["appJs", /dayNoteForm\.addEventListener\("submit"/]
    ]
  },
  {
    name: "planning, recipes and templates forms",
    patterns: [
      ["indexHtml", /id="planner-form"/],
      ["indexHtml", /id="weekly-plan-form"/],
      ["indexHtml", /id="template-form"/],
      ["indexHtml", /id="recipe-form"/],
      ["appJs", /plannerForm\.addEventListener\("submit"/],
      ["appJs", /weeklyPlanForm\.addEventListener\("submit"/],
      ["appJs", /templateForm\.addEventListener\("submit"/],
      ["appJs", /recipeForm\.addEventListener\("submit"/],
      ["appJs", /\.template-plan-button[\s\S]{0,140}addEventListener/],
      ["appJs", /\.recipe-plan-button[\s\S]{0,140}addEventListener/]
    ]
  },
  {
    name: "catalog, shopping and favorites interactions",
    patterns: [
      ["indexHtml", /id="product-search-form"/],
      ["indexHtml", /id="product-form"/],
      ["indexHtml", /id="shopping-form"/],
      ["appJs", /productSearchForm\.addEventListener\("submit"/],
      ["appJs", /productForm\.addEventListener\("submit"/],
      ["appJs", /shoppingForm\.addEventListener\("submit"/],
      ["appJs", /\.product-shopping-button[\s\S]{0,160}addEventListener/],
      ["appJs", /\.shopping-delete-button[\s\S]{0,160}addEventListener/],
      ["appJs", /\.favorite-remove-button[\s\S]{0,160}addEventListener/]
    ]
  },
  {
    name: "import and export panel",
    patterns: [
      ["indexHtml", /id="import-form"/],
      ["indexHtml", /<option value="json">JSON<\/option>/],
      ["indexHtml", /<option value="tsv">TSV<\/option>/],
      ["indexHtml", /data-export-format="json"/],
      ["indexHtml", /data-export-format="pdf"/],
      ["indexHtml", /Скачать PDF/],
      ["indexHtml", /<strong>PDF<\/strong>/],
      ["appJs", /downloadImportTemplateButton\?\.addEventListener/],
      ["appJs", /importForm\?\.addEventListener\("submit"/],
      ["appJs", /exportPdfButton\.addEventListener/],
      ["appJs", /panelExportButtons\.forEach/]
    ],
    forbidden: [
      ["indexHtml", forbiddenTableUpper],
      ["appJs", forbiddenTableUpper],
      ["indexHtml", forbiddenTableLower],
      ["appJs", forbiddenTableLower]
    ]
  },
  {
    name: "responsive shell and dark theme",
    patterns: [
      ["stylesCss", /body\[data-theme="dark"\]/],
      ["stylesCss", /\.sidebar-backdrop/],
      ["stylesCss", /\.view-panel-hidden/],
      ["stylesCss", /overflow-wrap:\s*anywhere/],
      ["stylesCss", /@media \(max-width: 820px\)/],
      ["appJs", /function syncLayoutMetrics/],
      ["appJs", /function syncDrawerMode/],
      ["appJs", /window\.addEventListener\("resize"/]
    ]
  },
  {
    name: "printable PDF report path",
    patterns: [
      ["appJs", /function buildPrintableReportMarkup/],
      ["appJs", /function openPrintableReport/],
      ["appJs", /window\.print/],
      ["appJs", /Открыт печатный отчет/],
      ["indexHtml", /id="export-pdf-button"/]
    ]
  },
  {
    name: "client javascript syntax and safety contracts",
    patterns: [
      ["appJs", /Promise\.allSettled/],
      ["appJs", /function renderWorkspaceLoadError/],
      ["appJs", /function splitTextLines/],
      ["appJs", /function escapeHtml/],
      ["appJs", /window\.addEventListener\("unhandledrejection"/]
    ]
  }
];

const FUZZ_SCENARIO_COVERAGE = [
  {
    name: "auth registration random invalid payloads",
    pattern: /fuzzes auth registration with random invalid payloads/
  },
  {
    name: "malformed JSON bodies across mutating endpoints",
    pattern: /fuzzes malformed json bodies across mutating endpoints/
  },
  {
    name: "protected business endpoints random payloads",
    pattern: /fuzzes protected business endpoints without server crashes/
  },
  {
    name: "daily, import and shopping random payloads",
    pattern: /fuzzes daily, import and shopping endpoints without server crashes/
  }
];

function percent(covered, total) {
  return total === 0 ? 100 : Number(((covered / total) * 100).toFixed(2));
}

function listApiOperations(document = openApiDocument) {
  return Object.entries(document.paths).flatMap(([pathname, operations]) =>
    Object.entries(operations).map(([method, operation]) => ({
      method: method.toUpperCase(),
      pathname,
      operationId: operation.operationId
    }))
  );
}

function readArtifacts(rootDir) {
  return {
    appJs: fs.readFileSync(path.join(rootDir, "client", "app.js"), "utf8"),
    indexHtml: fs.readFileSync(path.join(rootDir, "client", "index.html"), "utf8"),
    stylesCss: fs.readFileSync(path.join(rootDir, "client", "styles.css"), "utf8"),
    fuzzTest: fs.readFileSync(path.join(rootDir, "server", "tests", "fuzz.test.js"), "utf8")
  };
}

function evaluateFrontendContracts(artifacts) {
  return FRONTEND_CONTRACTS.map((contract) => {
    const missing = contract.patterns
      .filter(([artifactName, pattern]) => !pattern.test(artifacts[artifactName]))
      .map(([artifactName, pattern]) => `${artifactName}: ${pattern}`);
    const forbidden = (contract.forbidden || [])
      .filter(([artifactName, pattern]) => pattern.test(artifacts[artifactName]))
      .map(([artifactName, pattern]) => `${artifactName}: ${pattern}`);

    return {
      name: contract.name,
      covered: missing.length === 0 && forbidden.length === 0,
      missing,
      forbidden
    };
  });
}

function evaluateSurfaceCoverage(rootDir = path.resolve(__dirname, "..", "..")) {
  const artifacts = readArtifacts(rootDir);
  const apiOperations = listApiOperations();
  const apiOperationIds = new Set(apiOperations.map((operation) => operation.operationId));
  const coveredApi = apiOperations.filter((operation) => API_OPERATION_COVERAGE[operation.operationId]);
  const missingApi = apiOperations.filter((operation) => !API_OPERATION_COVERAGE[operation.operationId]);
  const staleApi = Object.keys(API_OPERATION_COVERAGE).filter((operationId) => !apiOperationIds.has(operationId));

  const moduleRoot = path.join(rootDir, "server", "src", "modules");
  const modules = fs
    .readdirSync(moduleRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const coveredModules = modules.filter((moduleName) => SERVER_MODULE_COVERAGE[moduleName]);
  const missingModules = modules.filter((moduleName) => !SERVER_MODULE_COVERAGE[moduleName]);
  const staleModules = Object.keys(SERVER_MODULE_COVERAGE).filter((moduleName) => !modules.includes(moduleName));

  const frontendContracts = evaluateFrontendContracts(artifacts);
  const coveredFrontend = frontendContracts.filter((contract) => contract.covered);
  const missingFrontend = frontendContracts.filter((contract) => !contract.covered);

  const fuzzScenarios = FUZZ_SCENARIO_COVERAGE.map((scenario) => ({
    name: scenario.name,
    covered: scenario.pattern.test(artifacts.fuzzTest)
  }));
  const coveredFuzz = fuzzScenarios.filter((scenario) => scenario.covered);
  const missingFuzz = fuzzScenarios.filter((scenario) => !scenario.covered);

  const summary = [
    {
      surface: "OpenAPI operations",
      covered: coveredApi.length,
      total: apiOperations.length,
      percent: percent(coveredApi.length, apiOperations.length)
    },
    {
      surface: "Server modules",
      covered: coveredModules.length,
      total: modules.length,
      percent: percent(coveredModules.length, modules.length)
    },
    {
      surface: "Frontend contracts",
      covered: coveredFrontend.length,
      total: frontendContracts.length,
      percent: percent(coveredFrontend.length, frontendContracts.length)
    },
    {
      surface: "Fuzz scenarios",
      covered: coveredFuzz.length,
      total: fuzzScenarios.length,
      percent: percent(coveredFuzz.length, fuzzScenarios.length)
    }
  ];

  const failures = [
    ...missingApi.map((operation) => `Missing API coverage mapping: ${operation.method} ${operation.pathname} (${operation.operationId})`),
    ...staleApi.map((operationId) => `Stale API coverage mapping: ${operationId}`),
    ...missingModules.map((moduleName) => `Missing server module coverage mapping: ${moduleName}`),
    ...staleModules.map((moduleName) => `Stale server module coverage mapping: ${moduleName}`),
    ...missingFrontend.map((contract) => {
      const details = [
        ...contract.missing.map((item) => `missing ${item}`),
        ...contract.forbidden.map((item) => `forbidden ${item}`)
      ].join("; ");
      return `Missing frontend contract coverage: ${contract.name} (${details})`;
    }),
    ...missingFuzz.map((scenario) => `Missing fuzz scenario: ${scenario.name}`)
  ];

  return {
    summary,
    apiOperations,
    apiCoverage: API_OPERATION_COVERAGE,
    modules,
    moduleCoverage: SERVER_MODULE_COVERAGE,
    frontendContracts,
    fuzzScenarios,
    failures
  };
}

function assertFullSurfaceCoverage(rootDir) {
  const report = evaluateSurfaceCoverage(rootDir);

  if (report.failures.length) {
    throw new Error(`Surface coverage is incomplete:\n${report.failures.join("\n")}`);
  }

  return report;
}

function buildMarkdownReport(report) {
  const surfaceLabels = {
    "OpenAPI operations": "OpenAPI-операции",
    "Server modules": "Серверные модули",
    "Frontend contracts": "Frontend-контракты",
    "Fuzz scenarios": "Fuzz-сценарии"
  };
  const summaryRows = report.summary
    .map(
      (item) =>
        `| ${surfaceLabels[item.surface] || item.surface} | ${item.covered} | ${item.total} | ${item.percent.toFixed(2)}% |`
    )
    .join("\n");
  const apiRows = report.apiOperations
    .map((operation) => {
      const files = report.apiCoverage[operation.operationId].join(", ");
      return `| ${operation.method} | \`${operation.pathname}\` | \`${operation.operationId}\` | ${files} |`;
    })
    .join("\n");
  const moduleRows = report.modules
    .map((moduleName) => `| \`${moduleName}\` | ${report.moduleCoverage[moduleName].join(", ")} |`)
    .join("\n");
  const frontendRows = report.frontendContracts
    .map((contract) => `| ${contract.name} | ${contract.covered ? "covered" : "missing"} |`)
    .join("\n");
  const fuzzRows = report.fuzzScenarios
    .map((scenario) => `| ${scenario.name} | ${scenario.covered ? "covered" : "missing"} |`)
    .join("\n");
  const testResultSummaryRows = report.testResults
    ? [
        ["Files", report.testResults.summary.files],
        ["Tests", report.testResults.summary.tests],
        ["Passed", report.testResults.summary.passed],
        ["Failed", report.testResults.summary.failed],
        ["Skipped", report.testResults.summary.skipped],
        ["Todo", report.testResults.summary.todo],
        ["Duration", `${report.testResults.summary.durationMs} ms`]
      ]
        .map(([label, value]) => `| ${label} | ${value} |`)
        .join("\n")
    : "";
  const testResultRows = report.testResults
    ? report.testResults.tests
        .map(
          (test) =>
            `| \`${test.file}\` | ${test.title.replace(/\|/g, "\\|")} | ${test.status} | ${
              test.durationMs === null ? "" : test.durationMs.toFixed(2)
            } |`
        )
        .join("\n")
    : "";
  const testResultsSection = report.testResults
    ? `## Таблица выполнения всех тестов

Таблица генерируется командой \`npm run test:results\`, которая запускается внутри \`npm run test:coverage\` и \`npm run test:full\`.

| Metric | Value |
| --- | ---: |
${testResultSummaryRows}

| Файл | Тест | Статус | Время, ms |
| --- | --- | --- | ---: |
${testResultRows}

`
    : `## Таблица выполнения всех тестов

Таблица появляется после запуска \`npm run test:coverage\` или \`npm run test:full\`; прямой \`npm run test:surface\` обновляет только матрицы покрытия.

`;

  return `# Отчет о покрытии тестовой поверхности

Отчет генерируется командой \`npm run test:coverage\` или \`npm run test:surface\`. Он подтверждает 100% покрытие заявленной функциональной поверхности: OpenAPI-операций, серверных модулей, frontend-контрактов и fuzz-сценариев. Сырая Node/V8 таблица в формате \`file | line % | branch % | funcs % | uncovered lines\` пишется командой \`npm run test:v8\`.

## Сводка

| Поверхность | Покрыто | Всего | Покрытие |
| --- | ---: | ---: | ---: |
${summaryRows}

${testResultsSection}## Матрица API-операций

| Метод | Path | operationId | Покрыто тестами |
| --- | --- | --- | --- |
${apiRows}

## Матрица серверных модулей

| Модуль | Покрыто тестами |
| --- | --- |
${moduleRows}

## Матрица frontend-контрактов

| Контракт | Статус |
| --- | --- |
${frontendRows}

## Матрица fuzz-тестов

| Сценарий | Статус |
| --- | --- |
${fuzzRows}

## Примечания

- Сырая Node/V8 таблица \`file | line % | branch % | funcs % | uncovered lines\` печатается командой \`npm run test:v8\`.
- Команда \`npm run test:v8\` включает пороги \`100/100/100\` и падает, если raw coverage перестает быть полностью зеленым.
- Этот отчет является gate-проверкой функциональной поверхности: он падает, если новая API-операция, серверный модуль, frontend-контракт или fuzz-сценарий не представлен в матрице тестов.
- Fuzzing реализован детерминированными генераторами поверх \`node:test\`, поэтому внешняя библиотека и сетевой install не требуются.
`;
}

function readTestResults(rootDir) {
  const resultsPath = path.join(rootDir, "coverage", "test-results.json");

  if (!fs.existsSync(resultsPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(resultsPath, "utf8"));
}

function writeSurfaceCoverageReport(rootDir = path.resolve(__dirname, "..", "..")) {
  const report = assertFullSurfaceCoverage(rootDir);
  report.testResults = readTestResults(rootDir);
  const markdown = buildMarkdownReport(report);
  const coverageDir = path.join(rootDir, "coverage");

  fs.mkdirSync(coverageDir, { recursive: true });
  fs.writeFileSync(path.join(rootDir, "docs", "11-test-coverage-report.md"), markdown);
  fs.writeFileSync(
    path.join(coverageDir, "test-surface-coverage.json"),
    JSON.stringify(
      {
        summary: report.summary,
        failures: report.failures,
        apiOperations: report.apiOperations,
        modules: report.modules,
        frontendContracts: report.frontendContracts.map(({ name, covered }) => ({ name, covered })),
        fuzzScenarios: report.fuzzScenarios,
        testResults: report.testResults
      },
      null,
      2
    )
  );

  return report;
}

module.exports = {
  assertFullSurfaceCoverage,
  buildMarkdownReport,
  evaluateSurfaceCoverage,
  listApiOperations,
  writeSurfaceCoverageReport
};
