const tokenStorageKey = "nutriTrackToken";
const themeStorageKey = "nutriTrackTheme";

const scoreLabels = {
  calories: "Калории",
  protein: "Белок",
  hydration: "Вода",
  rhythm: "Ритм",
  wellbeing: "Самочувствие",
  planning: "Планирование"
};

const metricLabels = {
  calories: { title: "Калории", unit: "ккал" },
  protein: { title: "Белки", unit: "г" },
  fat: { title: "Жиры", unit: "г" },
  carbs: { title: "Углеводы", unit: "г" }
};

const viewPanelAssignments = {
  overview: [
    "analytics-panel",
    "score-panel",
    "hydration-panel",
    "insights-panel",
    "recommendations-panel",
    "weekly-panel",
    "visuals-panel"
  ],
  comparison: ["comparison-panel"],
  controls: ["controls-panel"],
  wellbeing: ["wellbeing-panel", "body-metrics-panel"],
  "day-note": ["day-note-panel"],
  planner: ["planner-panel", "goals-panel", "templates-panel"],
  week: ["weekly-planner-panel"],
  recipes: ["recipes-panel"],
  favorites: ["favorites-panel"],
  journal: ["meal-panel", "journal-panel"],
  catalog: ["products-panel"],
  shopping: ["shopping-panel"],
  exchange: ["imports-panel"]
};

const state = {
  token: localStorage.getItem(tokenStorageKey),
  theme: localStorage.getItem(themeStorageKey) || "light",
  selectedDate: getTodayDate(),
  activeView: "overview",
  drawerOpen: false,
  importPreview: null,
  user: null,
  dashboard: null,
  goalPresets: [],
  meals: [],
  products: [],
  recipes: [],
  templates: [],
  metrics: null,
  shopping: null,
  weeklyPlans: [],
  weeklyPlanStart: getTodayDate(),
  weeklyPlanDays: 7,
  currentMealType: "Все",
  productSearch: "",
  recipeDraftIngredients: [
    { rowId: 1, productId: "", grams: 150 },
    { rowId: 2, productId: "", grams: 100 }
  ]
};

const authShell = document.querySelector("#auth-shell");
const appShell = document.querySelector("#app-shell");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const logoutButton = document.querySelector("#logout-button");
const authMessage = document.querySelector("#auth-message");
const sessionBadge = document.querySelector("#session-badge");
const sessionUserName = document.querySelector("#session-user-name");
const apiStatus = document.querySelector("#api-status");
const topbar = document.querySelector(".topbar");
const brandHomeButton = document.querySelector("#brand-home-button");
const sidebarToggleButton = document.querySelector("#sidebar-toggle");
const sidebarCloseButton = document.querySelector("#sidebar-close");
const sidebarBackdrop = document.querySelector("#sidebar-backdrop");
const workspaceSidebar = document.querySelector("#workspace-sidebar");
const refreshButton = document.querySelector("#refresh-button");
const themeToggle = document.querySelector("#theme-toggle");
const exportJsonButton = document.querySelector("#export-json-button");
const exportCsvButton = document.querySelector("#export-csv-button");
const exportPdfButton = document.querySelector("#export-pdf-button");
const panelExportButtons = [...document.querySelectorAll("[data-export-format]")];
const globalMessage = document.querySelector("#global-message");
const previousDateButton = document.querySelector("#previous-date-button");
const nextDateButton = document.querySelector("#next-date-button");
const todayButton = document.querySelector("#today-button");
const datePickerInput = document.querySelector("#date-picker-input");

const goalsForm = document.querySelector("#goals-form");
const mealForm = document.querySelector("#meal-form");
const recipeForm = document.querySelector("#recipe-form");
const templateForm = document.querySelector("#template-form");
const productForm = document.querySelector("#product-form");
const productSearchForm = document.querySelector("#product-search-form");
const productSearchInput = document.querySelector("#product-search-input");
const dayNoteForm = document.querySelector("#day-note-form");
const checkinForm = document.querySelector("#checkin-form");
const bodyMetricForm = document.querySelector("#body-metric-form");
const plannerForm = document.querySelector("#planner-form");
const weeklyPlanForm = document.querySelector("#weekly-plan-form");
const shoppingForm = document.querySelector("#shopping-form");
const importForm = document.querySelector("#import-form");

const goalPresetsList = document.querySelector("#goal-presets-list");
const productAdminPanel = document.querySelector("#product-admin-panel");
const productsMeta = document.querySelector("#products-meta");
const productsList = document.querySelector("#products-list");
const templatesList = document.querySelector("#templates-list");
const favoriteProductsList = document.querySelector("#favorite-products-list");
const favoriteTemplatesList = document.querySelector("#favorite-templates-list");
const recipesList = document.querySelector("#recipes-list");
const recipeIngredients = document.querySelector("#recipe-ingredients");
const addRecipeIngredientButton = document.querySelector("#add-recipe-ingredient-button");
const weeklyPlanMeta = document.querySelector("#weekly-plan-meta");
const weeklyPlanList = document.querySelector("#weekly-plan-list");
const comparisonCards = document.querySelector("#comparison-cards");
const comparisonSummary = document.querySelector("#comparison-summary");
const dailyControlsScore = document.querySelector("#daily-controls-score");
const dailyControlsCaption = document.querySelector("#daily-controls-caption");
const dailyControlsList = document.querySelector("#daily-controls-list");
const dayNotePreview = document.querySelector("#day-note-preview");
const recentDayNotes = document.querySelector("#recent-day-notes");
const summaryCards = document.querySelector("#summary-cards");
const mealsList = document.querySelector("#meals-list");
const mealCount = document.querySelector("#meal-count");
const summaryCardTemplate = document.querySelector("#summary-card-template");
const mealItemTemplate = document.querySelector("#meal-item-template");
const mealTypeBreakdown = document.querySelector("#meal-type-breakdown");
const weeklyTrend = document.querySelector("#weekly-trend");
const achievementsList = document.querySelector("#achievements-list");
const recommendationsList = document.querySelector("#recommendations-list");
const hydrationList = document.querySelector("#hydration-list");
const scoreBreakdown = document.querySelector("#score-breakdown");
const filterButtons = [...document.querySelectorAll("[data-meal-filter]")];
const quickWaterButtons = [...document.querySelectorAll("[data-water]")];
const wellbeingReadinessScore = document.querySelector("#wellbeing-readiness-score");
const wellbeingReadinessCaption = document.querySelector("#wellbeing-readiness-caption");
const wellbeingTrend = document.querySelector("#wellbeing-trend");
const bodyMetricsSummary = document.querySelector("#body-metrics-summary");
const bodyMetricsList = document.querySelector("#body-metrics-list");
const plannerMeta = document.querySelector("#planner-meta");
const plannerList = document.querySelector("#planner-list");
const shoppingMeta = document.querySelector("#shopping-meta");
const shoppingList = document.querySelector("#shopping-list");
const clearCheckedShoppingButton = document.querySelector("#clear-checked-shopping-button");
const navigationLinks = [...document.querySelectorAll(".sidebar-nav .sidebar-link[data-view]")];
const quickViewButtons = [...document.querySelectorAll("[data-view-target]")];
const heroSection = document.querySelector(".hero");
const trendComboChart = document.querySelector("#trend-combo-chart");
const trendComboSummary = document.querySelector("#trend-combo-summary");
const macroDonutChart = document.querySelector("#macro-donut-chart");
const macroDonutLegend = document.querySelector("#macro-donut-legend");
const wellbeingRadarChart = document.querySelector("#wellbeing-radar-chart");
const wellbeingRadarCaption = document.querySelector("#wellbeing-radar-caption");
const mealTimelineChart = document.querySelector("#meal-timeline-chart");
const importDatasetSelect = document.querySelector("#import-dataset-select");
const importFormatSelect = document.querySelector("#import-format-select");
const importFileInput = document.querySelector("#import-file-input");
const importRawInput = document.querySelector("#import-raw-input");
const importFileMeta = document.querySelector("#import-file-meta");
const importPreviewButton = document.querySelector("#import-preview-button");
const importApplyButton = document.querySelector("#import-apply-button");
const downloadImportTemplateButton = document.querySelector("#download-import-template-button");
const importPreviewSummary = document.querySelector("#import-preview-summary");
const importPreviewList = document.querySelector("#import-preview-list");
let viewPanels = [];

const heroCalories = document.querySelector("#hero-calories");
const heroCaloriesCaption = document.querySelector("#hero-calories-caption");
const heroCaloriesBar = document.querySelector("#hero-calories-bar");
const heroMealsCount = document.querySelector("#hero-meals-count");
const heroLastMeal = document.querySelector("#hero-last-meal");
const heroFocusTitle = document.querySelector("#hero-focus-title");
const heroFocusText = document.querySelector("#hero-focus-text");
const heroUpdatedAt = document.querySelector("#hero-updated-at");
const heroDateLabel = document.querySelector("#hero-date-label");
const heroStorage = document.querySelector("#hero-storage");
const heroUserName = document.querySelector("#hero-user-name");
const heroUserRole = document.querySelector("#hero-user-role");
const currentDateLabel = document.querySelector("#current-date-label");
const heroSmartScore = document.querySelector("#hero-smart-score");
const heroSmartScoreCaption = document.querySelector("#hero-smart-score-caption");
const heroStreak = document.querySelector("#hero-streak");
const heroStreakCaption = document.querySelector("#hero-streak-caption");
const heroWater = document.querySelector("#hero-water");
const heroWaterCaption = document.querySelector("#hero-water-caption");
const hydrationTotal = document.querySelector("#hydration-total");
const hydrationCaption = document.querySelector("#hydration-caption");
const hydrationProgress = document.querySelector("#hydration-progress");

const insightTopCalorieTitle = document.querySelector("#insight-top-calorie-title");
const insightTopCalorieText = document.querySelector("#insight-top-calorie-text");
const insightTopProteinTitle = document.querySelector("#insight-top-protein-title");
const insightTopProteinText = document.querySelector("#insight-top-protein-text");
const insightAverageCalories = document.querySelector("#insight-average-calories");
const insightAverageProtein = document.querySelector("#insight-average-protein");
const insightGoalStatus = document.querySelector("#insight-goal-status");
const insightGoalText = document.querySelector("#insight-goal-text");

function getTodayDate() {
  const now = new Date();
  const adjusted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 10);
}

function shiftDate(date, delta) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + delta);
  const adjusted = new Date(next.getTime() - next.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 10);
}

function setTheme(theme) {
  state.theme = theme;
  document.body.dataset.theme = theme;
  localStorage.setItem(themeStorageKey, theme);
  themeToggle.textContent = theme === "dark" ? "Светлая тема" : "Темная тема";
}

function setToken(token) {
  state.token = token;
  localStorage.setItem(tokenStorageKey, token);
}

function clearSession() {
  state.token = null;
  state.user = null;
  state.importPreview = null;
  localStorage.removeItem(tokenStorageKey);
}

function showFlash(message, type = "info") {
  globalMessage.textContent = message;
  globalMessage.className = `flash-message flash-${type}`;
  globalMessage.classList.remove("hidden");

  clearTimeout(showFlash.timeoutId);
  showFlash.timeoutId = setTimeout(() => {
    globalMessage.classList.add("hidden");
  }, 3500);
}

function reportClientError(error, fallbackMessage = "Не удалось выполнить действие.") {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : fallbackMessage;

  if (
    reportClientError.lastMessage === message &&
    Date.now() - (reportClientError.lastAt || 0) < 500
  ) {
    return;
  }

  reportClientError.lastMessage = message;
  reportClientError.lastAt = Date.now();
  showFlash(message || fallbackMessage, "error");
}

function setApiStatus(text) {
  apiStatus.textContent = text;
}

function getStorageLabel(metadata = {}) {
  const provider = String(metadata.dbProvider || metadata.storage || "").toLowerCase();

  if (provider.includes("postgres")) {
    return "Хранилище: PostgreSQL";
  }

  if (provider.includes("sqlite")) {
    return "Хранилище: SQLite";
  }

  return "Хранилище: серверная база данных";
}

function renderStackError(target, title, error) {
  if (!target) {
    return;
  }

  const details = error instanceof Error ? error.message : "Повторите загрузку или проверьте сервер.";
  target.innerHTML = `
    <article class="stack-card">
      <strong>${escapeHtml(title)}</strong>
      <p class="dashboard-note">${escapeHtml(details)}</p>
    </article>
  `;
}

function renderWorkspaceLoadError(error) {
  const message = error instanceof Error ? error.message : "Не удалось получить данные с сервера.";

  heroUpdatedAt.textContent = "Данные не синхронизированы";
  heroStorage.textContent = "Хранилище: недоступно";
  heroFocusTitle.textContent = "Ошибка загрузки";
  heroFocusText.textContent = message;
  dailyControlsCaption.textContent = "Не удалось загрузить контроль дня.";
  wellbeingReadinessCaption.textContent = "Не удалось загрузить самочувствие.";
  plannerMeta.textContent = "План недоступен";
  weeklyPlanMeta.textContent = "Недельный план недоступен";
  shoppingMeta.textContent = "Список покупок недоступен";

  renderStackError(plannerList, "План не загрузился", error);
  renderStackError(weeklyPlanList, "Недельный план не загрузился", error);
  renderStackError(shoppingList, "Список покупок не загрузился", error);
  renderStackError(productsList, "Каталог не загрузился", error);
  renderStackError(mealsList, "Журнал не загрузился", error);
}

function syncLayoutMetrics() {
  const compactLayout = window.matchMedia("(max-width: 820px)").matches;
  const topbarHeight = Math.ceil(topbar?.getBoundingClientRect().height || 0);
  const stickyOffset = Math.max(compactLayout ? 12 : 24, topbarHeight + (compactLayout ? 8 : 24));

  document.documentElement.style.setProperty("--sticky-top-offset", `${stickyOffset}px`);
  document.documentElement.style.setProperty("--topbar-height", `${topbarHeight}px`);
}

function registerViewPanels() {
  if (heroSection) {
    heroSection.dataset.viewPanel = "overview";
  }

  Object.entries(viewPanelAssignments).forEach(([view, panelIds]) => {
    panelIds.forEach((panelId) => {
      const panel = document.getElementById(panelId);

      if (panel) {
        panel.dataset.viewPanel = view;
      }
    });
  });

  viewPanels = [...document.querySelectorAll("[data-view-panel]")];
}

function isDesktopDrawer() {
  return window.matchMedia("(min-width: 1180px)").matches;
}

function parseViewFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  const normalized = hash.startsWith("view-") ? hash.slice(5) : hash;
  return viewPanelAssignments[normalized] ? normalized : null;
}

function updateViewHash(view) {
  const nextHash = view === "overview" ? "" : `#view-${view}`;
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
  window.history.replaceState(null, "", nextUrl);
}

function setDrawerOpen(open, { skipFocus = false } = {}) {
  state.drawerOpen = Boolean(open);

  document.body.classList.toggle("drawer-open", state.drawerOpen);
  document.body.classList.toggle("drawer-modal-open", state.drawerOpen && !isDesktopDrawer());
  sidebarToggleButton?.setAttribute("aria-expanded", String(state.drawerOpen));
  workspaceSidebar?.setAttribute("aria-hidden", state.drawerOpen ? "false" : "true");
  sidebarBackdrop?.classList.toggle("is-visible", state.drawerOpen && !isDesktopDrawer());

  if (!state.drawerOpen && !skipFocus) {
    sidebarToggleButton?.focus();
  }
}

function syncDrawerMode() {
  const desktopDrawer = isDesktopDrawer();

  if (syncDrawerMode.wasDesktop === undefined) {
    setDrawerOpen(desktopDrawer, { skipFocus: true });
  } else if (syncDrawerMode.wasDesktop !== desktopDrawer) {
    setDrawerOpen(desktopDrawer, { skipFocus: true });
  }

  syncDrawerMode.wasDesktop = desktopDrawer;
}

function setActiveSidebarLink(view, { reveal = false } = {}) {
  let activeLink = null;

  navigationLinks.forEach((link) => {
    const isCurrent = link.dataset.view === view;
    link.classList.toggle("is-current", isCurrent);
    link.setAttribute("aria-pressed", String(isCurrent));

    if (isCurrent) {
      activeLink = link;
    }
  });

  if (!activeLink) {
    return;
  }

  if (reveal) {
    activeLink.scrollIntoView({
      block: "nearest",
      inline: "center"
    });
  }
}

function updateActiveSectionLink() {
  if (!navigationLinks.length || !authShell.classList.contains("hidden")) {
    return;
  }

  setActiveSidebarLink(state.activeView, { reveal: !isDesktopDrawer() });
}

function setActiveView(view, { closeDrawer, focusTarget, scrollToTop = true, updateHash = true } = {}) {
  const nextView = viewPanelAssignments[view] ? view : "overview";
  const shouldCloseDrawer = closeDrawer ?? !isDesktopDrawer();
  const shouldScrollToTop = scrollToTop && !focusTarget;

  state.activeView = nextView;
  document.body.dataset.activeView = nextView;

  viewPanels.forEach((panel) => {
    panel.classList.toggle("view-panel-hidden", panel.dataset.viewPanel !== nextView);
  });

  updateActiveSectionLink();

  if (updateHash) {
    updateViewHash(nextView);
  }

  if (shouldCloseDrawer) {
    setDrawerOpen(false, { skipFocus: true });
  }

  requestAnimationFrame(() => {
    if (shouldScrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const targetNode =
      typeof focusTarget === "string" ? document.querySelector(focusTarget) : focusTarget || null;

    if (!targetNode) {
      return;
    }

    requestAnimationFrame(() => {
      targetNode.scrollIntoView({ behavior: "smooth", block: "start" });
      targetNode.focus?.();
    });
  });
}

function scheduleActiveSectionSync() {
  cancelAnimationFrame(scheduleActiveSectionSync.frameId);
  scheduleActiveSectionSync.frameId = requestAnimationFrame(() => {
    syncLayoutMetrics();
    syncDrawerMode();
    updateActiveSectionLink();
  });
}

window.addEventListener("unhandledrejection", (event) => {
  event.preventDefault();
  console.error(event.reason);
  reportClientError(event.reason);
});

window.addEventListener("error", (event) => {
  if (!event.error) {
    return;
  }

  console.error(event.error);
  reportClientError(event.error, "Ошибка в интерфейсе.");
});

function showAuth(message = "После входа откроется рабочая панель пользователя.") {
  authShell.classList.remove("hidden");
  appShell.classList.add("hidden");
  sessionBadge.classList.add("hidden");
  logoutButton.classList.add("hidden");
  exportJsonButton.classList.add("hidden");
  exportCsvButton.classList.add("hidden");
  exportPdfButton.classList.add("hidden");
  clearImportPreview();
  setDrawerOpen(false, { skipFocus: true });
  setApiStatus("Нужен вход");
  authMessage.textContent = message;
  syncLayoutMetrics();
}

function showApp() {
  authShell.classList.add("hidden");
  appShell.classList.remove("hidden");
  sessionBadge.classList.remove("hidden");
  logoutButton.classList.remove("hidden");
  exportJsonButton.classList.remove("hidden");
  exportCsvButton.classList.remove("hidden");
  exportPdfButton.classList.remove("hidden");
  syncLayoutMetrics();
  syncDrawerMode();
  setActiveView(state.activeView, {
    closeDrawer: false,
    scrollToTop: false,
    updateHash: false
  });
  setApiStatus("Система онлайн");
}

async function request(path, options = {}, authRequired = true) {
  const headers = {
    ...(options.headers || {})
  };

  if (!(options.body instanceof Blob)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (authRequired && state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => ({ error: "Invalid server response" }))
    : await response.text().catch(() => "");

  if (!response.ok) {
    if (response.status === 401 && authRequired) {
      clearSession();
      showAuth("Сессия завершена. Выполните вход снова.");
    }

    const message =
      typeof payload === "string" ? payload || "Request failed" : payload.error || "Request failed";
    throw new Error(message);
  }

  return payload;
}

function setFieldValue(form, key, value) {
  const input = form?.elements?.namedItem(key);

  if (input && value !== undefined && value !== null) {
    input.value = value;
  }
}

function focusField(form, key) {
  form?.elements?.namedItem(key)?.focus?.();
}

function revealSection(node) {
  const targetNode = node?.closest("[data-view-panel], .auth-panel") || node;
  const panelView = targetNode?.dataset?.viewPanel;

  if (panelView) {
    setActiveView(panelView, {
      closeDrawer: !isDesktopDrawer(),
      focusTarget: targetNode
    });
    return;
  }

  targetNode?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    setFieldValue(form, key, value);
  });
}

function toNumber(form, key) {
  const rawValue = form.elements.namedItem(key)?.value;
  return rawValue === "" ? null : Number(rawValue);
}

function formatMetricValue(metric, value) {
  return metric === "calories" ? value.toFixed(0) : value.toFixed(1);
}

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatShortDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit"
  });
}

function formatTime(value) {
  return value?.slice(0, 5) || "--:--";
}

function formatDelta(value, unit = "") {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? "+" : numeric < 0 ? "−" : "";
  const absolute = Math.abs(numeric);
  const formatted = absolute >= 10 ? absolute.toFixed(0) : absolute.toFixed(1);
  return `${sign}${formatted}${unit ? ` ${unit}` : ""}`;
}

function getFavoriteIds(type) {
  return new Set((state.dashboard?.favorites?.[type] || []).map((item) => item.id));
}

function getNextRecipeRowId() {
  return (
    state.recipeDraftIngredients.reduce(
      (maxValue, item) => Math.max(maxValue, Number(item.rowId) || 0),
      0
    ) + 1
  );
}

function resetRecipeDraft() {
  state.recipeDraftIngredients = [
    { rowId: 1, productId: "", grams: 150 },
    { rowId: 2, productId: "", grams: 100 }
  ];

  if (recipeForm) {
    recipeForm.reset();
    recipeForm.elements.namedItem("mealType").value = "Обед";
  }

  renderRecipeIngredientRows();
}

function renderRecipeIngredientRows() {
  if (!recipeIngredients) {
    return;
  }

  recipeIngredients.innerHTML = "";

  if (!state.products.length) {
    recipeIngredients.innerHTML =
      '<article class="stack-card"><p class="dashboard-note">Сначала нужен каталог продуктов, чтобы собрать составной рецепт.</p></article>';
    return;
  }

  state.recipeDraftIngredients.forEach((row, index) => {
    const node = document.createElement("article");
    node.className = "stack-card recipe-ingredient-row";
    const options = state.products
      .map(
        (product) => `
          <option value="${product.id}" ${String(product.id) === String(row.productId) ? "selected" : ""}>
            ${escapeHtml(product.name)}${product.brand ? ` · ${escapeHtml(product.brand)}` : ""}
          </option>
        `
      )
      .join("");

    node.innerHTML = `
      <div class="recipe-ingredient-grid">
        <label class="wide-field">
          Продукт ${index + 1}
          <select data-recipe-row="${row.rowId}" data-field="productId">
            <option value="">Выберите продукт</option>
            ${options}
          </select>
        </label>
        <label>
          Граммы
          <input data-recipe-row="${row.rowId}" data-field="grams" type="number" min="1" step="1" value="${row.grams}" />
        </label>
        <button class="danger-button small-button recipe-remove-button" data-recipe-row="${row.rowId}" type="button">
          Убрать
        </button>
      </div>
    `;

    node.querySelectorAll("[data-recipe-row]").forEach((input) => {
      input.addEventListener("input", () => {
        const rowId = Number(input.dataset.recipeRow);
        const target = state.recipeDraftIngredients.find((item) => item.rowId === rowId);

        if (!target) {
          return;
        }

        if (input.dataset.field === "grams") {
          target.grams = Number(input.value) || 0;
          return;
        }

        target.productId = input.value;
      });

      input.addEventListener("change", () => {
        const rowId = Number(input.dataset.recipeRow);
        const target = state.recipeDraftIngredients.find((item) => item.rowId === rowId);

        if (!target) {
          return;
        }

        if (input.dataset.field === "grams") {
          target.grams = Number(input.value) || 0;
          return;
        }

        target.productId = input.value;
      });
    });

    node.querySelector(".recipe-remove-button").addEventListener("click", () => {
      state.recipeDraftIngredients = state.recipeDraftIngredients.filter(
        (item) => item.rowId !== Number(row.rowId)
      );

      if (!state.recipeDraftIngredients.length) {
        state.recipeDraftIngredients = [{ rowId: getNextRecipeRowId(), productId: "", grams: 100 }];
      }

      renderRecipeIngredientRows();
    });

    recipeIngredients.append(node);
  });
}

function collectRecipeIngredients() {
  return state.recipeDraftIngredients
    .filter((item) => item.productId && Number(item.grams) > 0)
    .map((item) => ({
      productId: Number(item.productId),
      grams: Number(item.grams)
    }));
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatCompactNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function averageValue(items, key) {
  if (!items.length) {
    return 0;
  }

  return items.reduce((total, item) => total + Number(item[key] || 0), 0) / items.length;
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
}

function buildLinePath(points) {
  if (!points.length) {
    return "";
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
}

function buildClosedPath(points) {
  if (!points.length) {
    return "";
  }

  return `${buildLinePath(points)} Z`;
}

function renderChartPlaceholder(container, title, text) {
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="chart-empty">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(text)}</p>
    </div>
  `;
}

function renderMacroDonut(summary) {
  if (!macroDonutChart || !macroDonutLegend) {
    return;
  }

  const macroParts = [
    {
      key: "protein",
      label: "Белки",
      value: summary.totals.protein * 4,
      grams: summary.totals.protein,
      color: "#6f9d9b"
    },
    {
      key: "fat",
      label: "Жиры",
      value: summary.totals.fat * 9,
      grams: summary.totals.fat,
      color: "#8aa8c1"
    },
    {
      key: "carbs",
      label: "Углеводы",
      value: summary.totals.carbs * 4,
      grams: summary.totals.carbs,
      color: "#a7c9b5"
    }
  ];
  const total = macroParts.reduce((sum, part) => sum + part.value, 0);

  if (!total) {
    renderChartPlaceholder(
      macroDonutChart,
      "Нет данных для структуры КБЖУ",
      "Добавьте приемы пищи, и система построит кольцевую диаграмму по макросам."
    );
    macroDonutLegend.innerHTML = "";
    return;
  }

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const circles = macroParts
    .map((part) => {
      const dash = (part.value / total) * circumference;
      const svg = `
        <circle
          cx="90"
          cy="90"
          r="${radius}"
          fill="none"
          stroke="${part.color}"
          stroke-width="18"
          stroke-linecap="round"
          stroke-dasharray="${dash} ${circumference}"
          stroke-dashoffset="${-offset}"
          transform="rotate(-90 90 90)"
        ></circle>
      `;
      offset += dash;
      return svg;
    })
    .join("");

  macroDonutChart.innerHTML = `
    <svg class="chart-svg chart-svg-donut" viewBox="0 0 180 180" role="img" aria-label="Структура КБЖУ">
      <circle cx="90" cy="90" r="${radius}" fill="none" stroke="rgba(126, 166, 165, 0.14)" stroke-width="18"></circle>
      ${circles}
      <text x="90" y="84" text-anchor="middle" class="chart-center-label">КБЖУ</text>
      <text x="90" y="108" text-anchor="middle" class="chart-center-value">${formatCompactNumber(total, 0)}</text>
      <text x="90" y="126" text-anchor="middle" class="chart-center-note">ккал из макросов</text>
    </svg>
  `;

  macroDonutLegend.innerHTML = macroParts
    .map((part) => {
      const share = total ? (part.value / total) * 100 : 0;
      return `
        <article class="chart-legend-item">
          <span class="chart-legend-dot" style="background:${part.color}"></span>
          <div>
            <strong>${escapeHtml(part.label)}</strong>
            <p>${formatCompactNumber(part.grams, 1)} г · ${formatCompactNumber(share, 1)}%</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderTrendCombo(extendedTrend) {
  if (!trendComboChart || !trendComboSummary) {
    return;
  }

  const activeItems = extendedTrend.filter(
    (item) => item.calories > 0 || item.protein > 0 || item.mood > 0 || item.energy > 0
  );

  if (!activeItems.length) {
    renderChartPlaceholder(
      trendComboChart,
      "Недостаточно истории",
      "Система покажет 14-дневный тренд после заполнения нескольких дней дневника."
    );
    trendComboSummary.innerHTML = "";
    return;
  }

  const width = 860;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 44, left: 44 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxCalories = Math.max(...extendedTrend.map((item) => item.calories), 100);
  const barWidth = chartWidth / Math.max(extendedTrend.length * 1.8, 1);
  const moodEnergyPoints = extendedTrend.map((item, index) => {
    const averageMoodEnergy =
      item.mood || item.energy ? ((item.mood + item.energy) / 10) * 100 : 0;

    return {
      x:
        padding.left +
        (extendedTrend.length === 1 ? chartWidth / 2 : (chartWidth / (extendedTrend.length - 1)) * index),
      y: padding.top + chartHeight - (averageMoodEnergy / 100) * chartHeight
    };
  });
  const bars = extendedTrend
    .map((item, index) => {
      const x =
        padding.left +
        (extendedTrend.length === 1 ? chartWidth / 2 : (chartWidth / Math.max(extendedTrend.length - 1, 1)) * index) -
        barWidth / 2;
      const barHeight = (item.calories / maxCalories) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      return `
        <g>
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="10" fill="rgba(111, 157, 155, 0.28)"></rect>
          <text x="${(x + barWidth / 2).toFixed(1)}" y="${(padding.top + chartHeight + 20).toFixed(1)}" text-anchor="middle" class="chart-axis-label">
            ${escapeHtml(formatShortDate(item.date))}
          </text>
        </g>
      `;
    })
    .join("");

  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((step) => {
      const y = padding.top + chartHeight - chartHeight * step;
      return `
        <g>
          <line x1="${padding.left}" y1="${y.toFixed(1)}" x2="${width - padding.right}" y2="${y.toFixed(1)}" class="chart-grid-line"></line>
          <text x="${padding.left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="chart-axis-label">
            ${formatCompactNumber(maxCalories * step, 0)}
          </text>
        </g>
      `;
    })
    .join("");

  trendComboChart.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="14-дневный тренд калорий и состояния">
      ${gridLines}
      ${bars}
      <path d="${buildLinePath(moodEnergyPoints)}" fill="none" stroke="#5f7d92" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></path>
      ${moodEnergyPoints
        .map(
          (point) =>
            `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4.5" fill="#5f7d92" stroke="var(--surface-strong)" stroke-width="2"></circle>`
        )
        .join("")}
      <text x="${padding.left}" y="${padding.top - 4}" class="chart-caption">Калории</text>
      <text x="${width - padding.right}" y="${padding.top - 4}" text-anchor="end" class="chart-caption">Линия — среднее настроение и энергия</text>
    </svg>
  `;

  trendComboSummary.innerHTML = `
    <article class="chart-summary-card">
      <span>Средние калории</span>
      <strong>${formatCompactNumber(averageValue(activeItems, "calories"), 0)} ккал</strong>
    </article>
    <article class="chart-summary-card">
      <span>Средний белок</span>
      <strong>${formatCompactNumber(averageValue(activeItems, "protein"), 1)} г</strong>
    </article>
    <article class="chart-summary-card">
      <span>Настроение</span>
      <strong>${formatCompactNumber(averageValue(activeItems, "mood"), 1)} / 5</strong>
    </article>
    <article class="chart-summary-card">
      <span>Энергия</span>
      <strong>${formatCompactNumber(averageValue(activeItems, "energy"), 1)} / 5</strong>
    </article>
  `;
}

function renderWellbeingRadar(wellbeing) {
  if (!wellbeingRadarChart || !wellbeingRadarCaption) {
    return;
  }

  if (!wellbeing.entry) {
    renderChartPlaceholder(
      wellbeingRadarChart,
      "Нет check-in за дату",
      "Заполните самочувствие, и система построит радар состояния дня."
    );
    wellbeingRadarCaption.textContent = "Радар строится по настроению, энергии, стрессу, аппетиту и сну.";
    return;
  }

  const metrics = [
    { label: "Настроение", value: wellbeing.entry.mood / 5 },
    { label: "Энергия", value: wellbeing.entry.energy / 5 },
    { label: "Стресс", value: (6 - wellbeing.entry.stress) / 5 },
    { label: "Аппетит", value: wellbeing.entry.hunger / 5 },
    { label: "Сон", value: Math.min(wellbeing.entry.sleepHours / 8, 1) }
  ];
  const center = 120;
  const radius = 78;
  const polygonPoints = metrics.map((metric, index) => {
    const angle = (360 / metrics.length) * index;
    return polarToCartesian(center, center, radius * metric.value, angle);
  });
  const axisMarks = metrics
    .map((metric, index) => {
      const outer = polarToCartesian(center, center, radius, (360 / metrics.length) * index);
      return `
        <g>
          <line x1="${center}" y1="${center}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" class="chart-grid-line"></line>
          <text x="${outer.x.toFixed(1)}" y="${outer.y.toFixed(1)}" class="chart-axis-label chart-radar-label">
            ${escapeHtml(metric.label)}
          </text>
        </g>
      `;
    })
    .join("");
  const rings = [0.25, 0.5, 0.75, 1]
    .map((step) => {
      const points = metrics.map((_metric, index) =>
        polarToCartesian(center, center, radius * step, (360 / metrics.length) * index)
      );
      return `<path d="${buildClosedPath(points)}" class="chart-radar-ring"></path>`;
    })
    .join("");

  wellbeingRadarChart.innerHTML = `
    <svg class="chart-svg chart-svg-radar" viewBox="0 0 240 240" role="img" aria-label="Радар самочувствия">
      ${rings}
      ${axisMarks}
      <path d="${buildClosedPath(polygonPoints)}" class="chart-radar-area"></path>
      ${polygonPoints
        .map(
          (point) =>
            `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4" class="chart-radar-point"></circle>`
        )
        .join("")}
    </svg>
  `;
  wellbeingRadarCaption.textContent = `Готовность ${formatCompactNumber(wellbeing.readinessScore, 1)} · сон ${formatCompactNumber(wellbeing.entry.sleepHours, 1)} ч · стресс ${wellbeing.entry.stress}/5`;
}

function renderMealTimeline(meals) {
  if (!mealTimelineChart) {
    return;
  }

  if (!meals.length) {
    renderChartPlaceholder(
      mealTimelineChart,
      "Нет временной ленты",
      "После добавления приемов пищи появится лента дня с точками по времени."
    );
    return;
  }

  const width = 860;
  const height = 220;
  const padding = { left: 42, right: 34, top: 28, bottom: 32 };
  const startMinutes = 5 * 60;
  const endMinutes = 23 * 60;
  const span = endMinutes - startMinutes;
  const lineY = height - 74;
  const axisLabels = [6, 9, 12, 15, 18, 21]
    .map((hour) => {
      const x = padding.left + (((hour * 60 - startMinutes) / span) * (width - padding.left - padding.right));
      return `
        <g>
          <line x1="${x.toFixed(1)}" y1="${(lineY - 14).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(lineY + 14).toFixed(1)}" class="chart-grid-line"></line>
          <text x="${x.toFixed(1)}" y="${(height - 24).toFixed(1)}" text-anchor="middle" class="chart-axis-label">${hour}:00</text>
        </g>
      `;
    })
    .join("");

  const points = meals
    .slice()
    .sort((left, right) => left.eatenAt.localeCompare(right.eatenAt))
    .map((meal, index) => {
      const [hours, minutes] = meal.eatenAt.split(":").map(Number);
      const currentMinutes = Math.min(Math.max(hours * 60 + minutes, startMinutes), endMinutes);
      const x =
        padding.left + (((currentMinutes - startMinutes) / span) * (width - padding.left - padding.right));
      const y = index % 2 === 0 ? lineY - 44 : lineY + 44;
      return { meal, x, y };
    });

  mealTimelineChart.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Лента приемов пищи по времени">
      <line x1="${padding.left}" y1="${lineY}" x2="${width - padding.right}" y2="${lineY}" class="chart-grid-line"></line>
      ${axisLabels}
      ${points
        .map(
          ({ meal, x, y }) => `
            <g>
              <line x1="${x.toFixed(1)}" y1="${lineY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(95, 125, 146, 0.36)" stroke-width="2"></line>
              <circle cx="${x.toFixed(1)}" cy="${lineY}" r="6" fill="#6f9d9b"></circle>
              <rect x="${(x - 66).toFixed(1)}" y="${(y - 22).toFixed(1)}" width="132" height="44" rx="14" fill="var(--surface-strong)" stroke="var(--line)"></rect>
              <text x="${x.toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="middle" class="chart-axis-label">${escapeHtml(meal.mealType)} · ${escapeHtml(formatTime(meal.eatenAt))}</text>
              <text x="${x.toFixed(1)}" y="${(y + 14).toFixed(1)}" text-anchor="middle" class="chart-caption">${escapeHtml(meal.title)} · ${formatCompactNumber(meal.calories, 0)} ккал</text>
            </g>
          `
        )
        .join("")}
    </svg>
  `;
}

function renderVisualizations(dashboard) {
  renderMacroDonut(dashboard.summary);
  renderTrendCombo(dashboard.extendedTrend || []);
  renderWellbeingRadar(dashboard.wellbeing);
  renderMealTimeline(dashboard.meals);
}

function clearImportPreview() {
  state.importPreview = null;
  if (importPreviewSummary) {
    importPreviewSummary.innerHTML = "";
  }
  if (importPreviewList) {
    importPreviewList.innerHTML =
      '<article class="stack-card"><p class="dashboard-note">Загрузите файл или вставьте данные, затем нажмите «Предпросмотр».</p></article>';
  }
  if (importApplyButton) {
    importApplyButton.disabled = true;
  }
}

async function readImportContent() {
  const file = importFileInput?.files?.[0];

  if (file) {
    importFileMeta.textContent = `Файл: ${file.name} · ${(file.size / 1024).toFixed(1)} КБ`;
    return file.text();
  }

  const raw = importRawInput?.value?.trim() || "";

  if (!raw) {
    throw new Error("Добавьте файл или вставьте данные для импорта.");
  }

  importFileMeta.textContent = `Вставка данных · ${raw.length} символов`;
  return raw;
}

function buildImportPayload(content) {
  return {
    dataset: importDatasetSelect.value,
    format: importFormatSelect.value,
    content
  };
}

function renderImportPreview(preview) {
  state.importPreview = preview;
  importApplyButton.disabled = preview.summary.acceptedRows === 0;

  importPreviewSummary.innerHTML = `
    <article class="stack-card">
      <p class="dashboard-label">Набор</p>
      <strong>${escapeHtml(preview.datasetLabel)}</strong>
    </article>
    <article class="stack-card">
      <p class="dashboard-label">Всего строк</p>
      <strong>${preview.summary.totalRows}</strong>
    </article>
    <article class="stack-card">
      <p class="dashboard-label">Готово к импорту</p>
      <strong>${preview.summary.acceptedRows}</strong>
    </article>
    <article class="stack-card">
      <p class="dashboard-label">Ошибок</p>
      <strong>${preview.summary.invalidRows}</strong>
    </article>
  `;

  const previewRows = preview.previewItems.length
    ? preview.previewItems
        .map((item) => {
          const fields = Object.entries(item)
            .filter(([key]) => key !== "rowNumber")
            .slice(0, 6)
            .map(([key, value]) => `<span class="info-badge">${escapeHtml(key)}: ${escapeHtml(String(value))}</span>`)
            .join("");

          return `
            <article class="stack-card">
              <strong>Строка ${item.rowNumber}</strong>
              <div class="import-preview-tags">${fields}</div>
            </article>
          `;
        })
        .join("")
    : '<article class="stack-card"><p class="dashboard-note">Валидных строк пока нет.</p></article>';

  const issues = preview.issues.length
    ? `
      <article class="stack-card">
        <strong>Проблемные строки</strong>
        <div class="stack-list">
          ${preview.issues
            .slice(0, 8)
            .map(
              (issue) =>
                `<p class="dashboard-note">Строка ${issue.rowNumber}: ${escapeHtml(issue.message)}</p>`
            )
            .join("")}
        </div>
      </article>
    `
    : `
      <article class="stack-card import-success-card">
        <strong>Структура выглядит корректно</strong>
        <p class="dashboard-note">Можно запускать импорт. Колонки: ${escapeHtml(preview.columns.join(", "))}</p>
      </article>
    `;

  importPreviewList.innerHTML = `${previewRows}${issues}`;
}

async function downloadImportTemplate() {
  const dataset = importDatasetSelect.value;
  const format = importFormatSelect.value;
  const response = await fetch(
    `/api/imports/template?dataset=${encodeURIComponent(dataset)}&format=${encodeURIComponent(format)}`,
    {
      headers: {
        Authorization: `Bearer ${state.token}`
      }
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Не удалось загрузить шаблон");
  }

  const content = await response.text();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
  const filename = filenameMatch?.[1] || `ration-import-template.${format}`;
  const mimeType = response.headers.get("content-type") || "text/plain;charset=utf-8";
  downloadTextFile(filename, content, mimeType);
}

async function refreshAfterImport(dataset) {
  if (dataset === "meals") {
    await Promise.all([loadDashboard(), loadMeals()]);
    return;
  }

  if (dataset === "templates") {
    await Promise.all([loadTemplates(), loadDashboard()]);
    return;
  }

  if (dataset === "hydration") {
    await loadDashboard();
    return;
  }

  if (dataset === "products") {
    await Promise.all([loadProducts(), loadDashboard()]);
  }
}

async function refreshPlannerViews() {
  await Promise.all([loadDashboard(), loadWeeklyPlans()]);
}

function formatPrintableMetric(value, unit, digits = 0) {
  const numeric = Number(value || 0);
  return `${numeric.toLocaleString("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })} ${unit}`;
}

async function fetchDailyReport() {
  return request(`/api/exports/daily-report?date=${encodeURIComponent(state.selectedDate)}`);
}

function buildPrintableReportMarkup(report) {
  const metrics = [
    {
      label: "Калории",
      total: report.totals.calories,
      goal: report.goals.calories,
      unit: "ккал",
      digits: 0
    },
    {
      label: "Белки",
      total: report.totals.protein,
      goal: report.goals.protein,
      unit: "г",
      digits: 1
    },
    {
      label: "Жиры",
      total: report.totals.fat,
      goal: report.goals.fat,
      unit: "г",
      digits: 1
    },
    {
      label: "Углеводы",
      total: report.totals.carbs,
      goal: report.goals.carbs,
      unit: "г",
      digits: 1
    }
  ];

  const summaryCards = [
    {
      label: "Приемов пищи",
      value: String(report.meals.length)
    },
    {
      label: "Вода",
      value: formatPrintableMetric(report.hydration.totalMl, "мл", 0)
    },
    {
      label: "Цель по воде",
      value: formatPrintableMetric(report.hydration.targetMl, "мл", 0)
    },
    {
      label: "Профиль",
      value: escapeHtml(report.user.name || report.user.email)
    }
  ]
    .map(
      (item) => `
        <article class="report-card">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </article>
      `
    )
    .join("");

  const goalRows = metrics
    .map((metric) => {
      const progress = metric.goal > 0 ? Math.min((metric.total / metric.goal) * 100, 100) : 0;
      return `
        <article class="goal-row">
          <div class="goal-row-head">
            <strong>${metric.label}</strong>
            <span>${formatPrintableMetric(metric.total, metric.unit, metric.digits)} из ${formatPrintableMetric(
              metric.goal,
              metric.unit,
              metric.digits
            )}</span>
          </div>
          <div class="goal-row-track">
            <div class="goal-row-fill" style="width:${progress}%"></div>
          </div>
        </article>
      `;
    })
    .join("");

  const mealRows = report.meals.length
    ? report.meals
        .map(
          (meal) => `
            <tr>
              <td>${escapeHtml(formatTime(meal.eatenAt))}</td>
              <td>${escapeHtml(meal.mealType)}</td>
              <td>
                <strong>${escapeHtml(meal.title)}</strong>
                <div class="table-note">${escapeHtml(meal.notes || "Без комментария")}</div>
              </td>
              <td>${formatPrintableMetric(meal.grams, "г", 0)}</td>
              <td>${formatPrintableMetric(meal.calories, "ккал", 0)}</td>
              <td>${formatPrintableMetric(meal.protein, "г", 1)}</td>
              <td>${formatPrintableMetric(meal.fat, "г", 1)}</td>
              <td>${formatPrintableMetric(meal.carbs, "г", 1)}</td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td colspan="8" class="empty-state">На выбранную дату записи отсутствуют.</td>
      </tr>
    `;

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <title>Рацион — отчет за ${escapeHtml(report.date)}</title>
    <style>
      :root {
        color-scheme: light;
        --paper: #ffffff;
        --paper-soft: #f4f8f7;
        --line: #d6e0df;
        --text: #1b2430;
        --muted: #667787;
        --accent: #6d8c98;
        --accent-soft: #dce9e6;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        background: #e9f0ee;
        color: var(--text);
        font-family: "Segoe UI", "Segoe UI Variable Text", sans-serif;
      }

      .toolbar {
        position: sticky;
        top: 0;
        display: flex;
        justify-content: center;
        gap: 12px;
        padding: 16px;
        background: rgba(233, 240, 238, 0.92);
        backdrop-filter: blur(8px);
      }

      .toolbar button {
        min-height: 42px;
        padding: 0 16px;
        border: 1px solid #c9d7d4;
        border-radius: 999px;
        background: white;
        color: var(--text);
        font: inherit;
        cursor: pointer;
      }

      .report-shell {
        max-width: 1040px;
        margin: 0 auto;
        padding: 18px 18px 42px;
      }

      .report-page {
        padding: 34px;
        border-radius: 28px;
        background: var(--paper);
        box-shadow: 0 18px 44px rgba(44, 63, 71, 0.08);
      }

      .report-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 240px;
        gap: 20px;
        margin-bottom: 26px;
      }

      .eyebrow {
        margin: 0 0 10px;
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .report-title {
        margin: 0;
        font-family: "Palatino Linotype", "Book Antiqua", Georgia, serif;
        font-size: 46px;
        line-height: 1;
      }

      .report-subtitle {
        margin: 12px 0 0;
        max-width: 42ch;
        color: var(--muted);
        font-size: 17px;
        line-height: 1.55;
      }

      .report-meta-card {
        padding: 18px 20px;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: var(--paper-soft);
      }

      .report-meta-card strong,
      .report-card strong,
      .goal-row strong,
      td strong {
        display: block;
      }

      .report-meta-card span,
      .report-card span,
      .goal-row span,
      .table-note,
      .report-footer {
        color: var(--muted);
      }

      .report-meta-card + .report-meta-card {
        margin-top: 12px;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 24px;
      }

      .report-card {
        padding: 16px 18px;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: var(--paper-soft);
      }

      .report-card strong {
        margin-top: 10px;
        font-size: 24px;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }

      .goals-panel,
      .meals-panel {
        padding: 22px 24px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: white;
      }

      .goals-panel { margin-bottom: 20px; }

      .goals-grid {
        display: grid;
        gap: 14px;
      }

      .goal-row-head {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 8px;
      }

      .goal-row-track {
        height: 10px;
        border-radius: 999px;
        background: #e7efed;
        overflow: hidden;
      }

      .goal-row-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #87a7ab, #6d8c98);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 12px 10px;
        border-bottom: 1px solid var(--line);
        text-align: left;
        vertical-align: top;
        font-size: 14px;
      }

      th {
        color: var(--accent);
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .table-note {
        margin-top: 6px;
        line-height: 1.45;
        overflow-wrap: anywhere;
      }

      .empty-state {
        color: var(--muted);
        text-align: center;
        padding: 24px;
      }

      .report-footer {
        margin-top: 18px;
        font-size: 12px;
        text-align: right;
      }

      @media print {
        @page {
          size: A4;
          margin: 14mm;
        }

        body {
          background: white;
        }

        .toolbar {
          display: none;
        }

        .report-shell {
          max-width: none;
          padding: 0;
        }

        .report-page {
          box-shadow: none;
          border-radius: 0;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <button onclick="window.print()">Сохранить как PDF</button>
      <button onclick="window.close()">Закрыть</button>
    </div>
    <main class="report-shell">
      <section class="report-page">
        <header class="report-header">
          <div>
            <p class="eyebrow">Персональный дневник питания</p>
            <h1 class="report-title">Рацион</h1>
            <p class="report-subtitle">
              Отчет по рациону за ${escapeHtml(formatDate(report.date))}. Сводка по КБЖУ, воде и журналу приемов пищи за выбранный день.
            </p>
          </div>
          <div>
            <article class="report-meta-card">
              <span>Профиль</span>
              <strong>${escapeHtml(report.user.name || report.user.email)}</strong>
            </article>
            <article class="report-meta-card">
              <span>Почта</span>
              <strong>${escapeHtml(report.user.email)}</strong>
            </article>
            <article class="report-meta-card">
              <span>Дата отчета</span>
              <strong>${escapeHtml(formatDate(report.date))}</strong>
            </article>
          </div>
        </header>

        <section class="summary-grid">
          ${summaryCards}
        </section>

        <section class="goals-panel">
          <p class="eyebrow">Сводка по целям</p>
          <div class="goals-grid">
            ${goalRows}
          </div>
        </section>

        <section class="meals-panel">
          <p class="eyebrow">Журнал приемов пищи</p>
          <table>
            <thead>
              <tr>
                <th>Время</th>
                <th>Тип</th>
                <th>Блюдо</th>
                <th>Вес</th>
                <th>Ккал</th>
                <th>Б</th>
                <th>Ж</th>
                <th>У</th>
              </tr>
            </thead>
            <tbody>
              ${mealRows}
            </tbody>
          </table>
        </section>

        <p class="report-footer">Сформировано в системе «Рацион»</p>
      </section>
    </main>
  </body>
</html>`;
}

function openPrintableReport(report) {
  const popup = window.open("", "_blank", "width=1100,height=900");

  if (!popup) {
    throw new Error("Браузер заблокировал окно отчета. Разрешите всплывающие окна.");
  }

  popup.document.write(buildPrintableReportMarkup(report));
  popup.document.close();
  popup.focus();
  popup.setTimeout(() => {
    popup.print();
  }, 280);
}

function syncDateControls() {
  datePickerInput.value = state.selectedDate;
  setFieldValue(plannerForm, "date", state.selectedDate);
}

function getFocus(dashboard) {
  const { meals, goals, summary, insights, hydration, wellbeing, planner, dayNote } = dashboard;

  if (!meals.length) {
    return {
      title: "Начните дневник",
      text: "Добавьте первый прием пищи и запись воды, чтобы открыть аналитику дня."
    };
  }

  if (hydration.progress < 60) {
    return {
      title: "Добавьте воды",
      text: `Сейчас закрыто только ${Math.round(hydration.progress)}% дневной гидратации.`
    };
  }

  if (wellbeing.entry && wellbeing.entry.stress >= 4) {
    return {
      title: "Снизить нагрузку",
      text: "Сегодня стоит сделать ставку на простой и предсказуемый режим питания."
    };
  }

  if (planner.totals.planned > planner.totals.completed) {
    return {
      title: "Держать план",
      text: `В планере еще ${planner.totals.planned - planner.totals.completed} открытых слотов.`
    };
  }

  if (dayNote?.focus) {
    return {
      title: "Фокус из заметки",
      text: dayNote.focus
    };
  }

  if (!insights.withinCalorieGoal) {
    return {
      title: "Проверить калорийность",
      text: `Есть превышение цели на ${(summary.totals.calories - goals.calories).toFixed(0)} ккал.`
    };
  }

  if (summary.remaining.protein > 20) {
    return {
      title: "Доберите белок",
      text: `До дневной цели не хватает ${summary.remaining.protein.toFixed(1)} г белка.`
    };
  }

  return {
    title: "День выглядит уверенно",
    text: `Индекс дня сейчас на уровне ${dashboard.smartScore.total}.`
  };
}

function fillMealFormFromSource(source, titleOverride) {
  setFieldValue(mealForm, "title", titleOverride || source.name || source.title);
  setFieldValue(mealForm, "mealType", source.mealType || "Перекус");
  setFieldValue(mealForm, "grams", source.grams || 100);
  setFieldValue(mealForm, "calories", source.calories);
  setFieldValue(mealForm, "protein", source.protein);
  setFieldValue(mealForm, "fat", source.fat);
  setFieldValue(mealForm, "carbs", source.carbs);
  setFieldValue(mealForm, "notes", source.notes || "");
  revealSection(mealForm);
  focusField(mealForm, "title");
}

function fillPlannerFormFromSource(source, titleOverride) {
  setFieldValue(plannerForm, "title", titleOverride || source.name || source.title);
  setFieldValue(plannerForm, "mealType", source.mealType || "Обед");
  setFieldValue(plannerForm, "date", state.selectedDate);
  setFieldValue(plannerForm, "plannedTime", source.eatenAt || "13:00");
  setFieldValue(plannerForm, "targetCalories", source.calories || 0);
  setFieldValue(plannerForm, "targetProtein", source.protein || 0);
  setFieldValue(plannerForm, "targetFat", source.fat || 0);
  setFieldValue(plannerForm, "targetCarbs", source.carbs || 0);
  revealSection(plannerForm);
  focusField(plannerForm, "title");
}

function renderSummary(summary, goals) {
  summaryCards.innerHTML = "";

  Object.entries(metricLabels).forEach(([key, config]) => {
    const card = summaryCardTemplate.content.firstElementChild.cloneNode(true);
    const total = summary.totals[key];
    const goal = goals[key];
    const remaining = summary.remaining[key];
    const progress = Math.min(summary.progress[key], 100);

    card.querySelector(".metric-name").textContent = config.title;
    card.querySelector(".metric-total").textContent =
      `${formatMetricValue(key, total)} ${config.unit}`;
    card.querySelector(".metric-details").textContent =
      `Цель: ${formatMetricValue(key, goal)} ${config.unit} · Осталось: ${formatMetricValue(key, remaining)} ${config.unit}`;
    card.querySelector(".progress-fill").style.width = `${progress}%`;

    summaryCards.append(card);
  });
}

function renderScoreBreakdown(score) {
  scoreBreakdown.innerHTML = "";

  Object.entries(score.breakdown).forEach(([key, value]) => {
    const card = document.createElement("article");
    card.className = "score-card";
    card.innerHTML = `
      <p class="dashboard-label">${escapeHtml(scoreLabels[key] || key)}</p>
      <strong>${value.toFixed(1)}</strong>
      <div class="mini-progress">
        <div class="mini-progress-fill" style="width:${Math.min(value, 100)}%"></div>
      </div>
    `;
    scoreBreakdown.append(card);
  });
}

function renderBreakdown(items) {
  mealTypeBreakdown.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "breakdown-card";
    card.innerHTML = `
      <p class="dashboard-label">${escapeHtml(item.mealType)}</p>
      <strong>${item.count}</strong>
      <p class="dashboard-note">${item.calories.toFixed(0)} ккал</p>
    `;
    mealTypeBreakdown.append(card);
  });
}

function renderAchievements(items) {
  achievementsList.innerHTML = "";

  if (!items.length) {
    achievementsList.innerHTML =
      '<article class="badge-card"><strong>Пока без достижений</strong><p class="dashboard-note">Система покажет значки, когда накопится нужная активность.</p></article>';
    return;
  }

  items.forEach((item) => {
    const badge = document.createElement("article");
    badge.className = "badge-card";
    badge.innerHTML = `
      <strong>${escapeHtml(item.title)}</strong>
      <p class="dashboard-note">${escapeHtml(item.description)}</p>
    `;
    achievementsList.append(badge);
  });
}

async function addProductToShopping(productId, productName, overrides = {}) {
  await request(`/api/shopping/from-product/${productId}`, {
    method: "POST",
    body: JSON.stringify({
      quantity: overrides.quantity || 1,
      unit: overrides.unit || "шт",
      notes: overrides.notes || ""
    })
  });
  await Promise.all([loadShopping(), loadDashboard()]);
  showFlash(`"${productName}" добавлен в список покупок`, "success");
}

function renderRecommendations(items) {
  recommendationsList.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "recommendation-card";
    const suggestions = item.suggestedProducts
      .map(
        (product) => `
          <div class="suggestion-tile">
            <button class="suggestion-chip" type="button" data-product-id="${product.id}" data-mode="meal">
              В прием · ${escapeHtml(product.name)}
            </button>
            <button class="ghost-button small-button" type="button" data-product-id="${product.id}" data-mode="shopping">
              В список
            </button>
          </div>
        `
      )
      .join("");

    card.innerHTML = `
      <p class="dashboard-label">${escapeHtml(item.title)}</p>
      <strong>${escapeHtml(item.text)}</strong>
      <div class="suggestion-row">${suggestions}</div>
    `;

    card.querySelectorAll("[data-product-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const product = item.suggestedProducts.find(
          (entry) => String(entry.id) === button.dataset.productId
        );

        if (!product) {
          return;
        }

        if (button.dataset.mode === "shopping") {
          await addProductToShopping(product.id, product.name, {
            notes: `Добавлено из рекомендаций: ${item.title}`
          });
          return;
        }

        fillMealFormFromSource(
          {
            ...product,
            grams: 100,
            mealType: "Перекус",
            notes: `Добавлено по рекомендации: ${item.title}`
          },
          product.name
        );
        showFlash(`Продукт "${product.name}" перенесен в форму`, "success");
      });
    });

    recommendationsList.append(card);
  });
}

function renderInsights(dashboard) {
  const { insights, summary, goals } = dashboard;

  if (!insights.topCalorieMeal) {
    insightTopCalorieTitle.textContent = "Нет записей";
    insightTopCalorieText.textContent = "Добавьте первый прием пищи.";
    insightTopProteinTitle.textContent = "Нет записей";
    insightTopProteinText.textContent = "Добавьте первый прием пищи.";
    insightAverageCalories.textContent = "0 ккал";
    insightAverageProtein.textContent = "Средний белок: 0.0 г";
    insightGoalStatus.textContent = "Нет активности";
    insightGoalText.textContent = "Показатели появятся после заполнения журнала.";
  } else {
    insightTopCalorieTitle.textContent = insights.topCalorieMeal.title;
    insightTopCalorieText.textContent =
      `${insights.topCalorieMeal.calories.toFixed(0)} ккал · ${insights.topCalorieMeal.mealType}`;
    insightTopProteinTitle.textContent = insights.topProteinMeal.title;
    insightTopProteinText.textContent =
      `${insights.topProteinMeal.protein.toFixed(1)} г белка · ${insights.topProteinMeal.mealType}`;
    insightAverageCalories.textContent = `${insights.averageCalories.toFixed(0)} ккал`;
    insightAverageProtein.textContent = `Средний белок: ${insights.averageProtein.toFixed(1)} г`;
    insightGoalStatus.textContent = insights.withinCalorieGoal
      ? "Цель соблюдается"
      : "Превышение лимита";
    insightGoalText.textContent = insights.withinCalorieGoal
      ? `До лимита осталось ${summary.remaining.calories.toFixed(0)} ккал.`
      : `Превышение составило ${(summary.totals.calories - goals.calories).toFixed(0)} ккал.`;
  }

  renderBreakdown(insights.mealTypeBreakdown);
}

function renderWeeklyTrend(items) {
  weeklyTrend.innerHTML = "";
  const maxCalories = Math.max(...items.map((item) => item.calories), 1);

  items.forEach((item) => {
    const bar = document.createElement("article");
    bar.className = "weekly-card";
    bar.innerHTML = `
      <p class="dashboard-label">${formatShortDate(item.date)}</p>
      <strong>${item.calories.toFixed(0)} ккал</strong>
      <p class="dashboard-note">Белки: ${item.protein.toFixed(1)} г · Вода: ${item.hydrationMl.toFixed(0)} мл</p>
      <div class="mini-progress">
        <div class="mini-progress-fill" style="width:${(item.calories / maxCalories) * 100}%"></div>
      </div>
    `;
    weeklyTrend.append(bar);
  });
}

function renderComparison(comparison) {
  comparisonCards.innerHTML = "";

  comparison.items.forEach((item) => {
    const card = document.createElement("article");
    const directionClass =
      item.delta > 0 ? "delta-up" : item.delta < 0 ? "delta-down" : "delta-neutral";
    card.className = "stack-card comparison-card";
    card.innerHTML = `
      <p class="dashboard-label">${escapeHtml(item.title)}</p>
      <strong>${item.current.toFixed(item.unit === "ккал" || item.unit === "мл" ? 0 : 1)} ${escapeHtml(item.unit)}</strong>
      <p class="dashboard-note">Вчера: ${item.previous.toFixed(item.unit === "ккал" || item.unit === "мл" ? 0 : 1)} ${escapeHtml(item.unit)}</p>
      <span class="delta-pill ${directionClass}">${formatDelta(item.delta, item.unit)}</span>
    `;
    comparisonCards.append(card);
  });

  comparisonSummary.innerHTML = `
    <article class="stack-card comparison-summary-card">
      <strong>Средние значения за 7 дней</strong>
      <p class="dashboard-note">
        Калории ${comparison.weeklyAverage.calories.toFixed(0)} ккал · Белок ${comparison.weeklyAverage.protein.toFixed(1)} г ·
        Вода ${comparison.weeklyAverage.hydrationMl.toFixed(0)} мл · Готовность ${comparison.weeklyAverage.readinessScore.toFixed(1)}
      </p>
      <p class="dashboard-note">Базовая точка сравнения: ${formatDate(comparison.previousDate)}</p>
    </article>
  `;
}

function renderDailyControls(controls) {
  dailyControlsScore.textContent = `${Math.round(controls.adherence)}%`;
  dailyControlsCaption.textContent =
    `${controls.completed} из ${controls.total} контрольных точек закрыто на выбранную дату`;
  dailyControlsList.innerHTML = "";

  controls.items.forEach((item) => {
    const node = document.createElement("article");
    node.className = `stack-card control-card ${item.completed ? "control-card-complete" : ""}`;
    node.innerHTML = `
      <div class="stack-card-head">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p class="dashboard-note">${escapeHtml(item.description)}</p>
        </div>
        <span class="status-badge ${item.completed ? "status-badge-ok" : "status-badge-pending"}">
          ${item.completed ? "Закрыто" : "Открыто"}
        </span>
      </div>
    `;
    dailyControlsList.append(node);
  });
}

function renderHydration(hydration) {
  hydrationTotal.textContent = `${hydration.totalMl.toFixed(0)} мл`;
  hydrationCaption.textContent = `Цель ${hydration.targetMl} мл · ${Math.round(hydration.progress)}%`;
  hydrationProgress.style.width = `${Math.min(hydration.progress, 100)}%`;
  heroWater.textContent = `${hydration.totalMl.toFixed(0)} мл`;
  heroWaterCaption.textContent = `Цель ${hydration.targetMl} мл`;

  hydrationList.innerHTML = "";

  if (!hydration.entries.length) {
    hydrationList.innerHTML =
      '<article class="stack-card"><p class="dashboard-note">Записей воды на выбранную дату пока нет.</p></article>';
    return;
  }

  hydration.entries.forEach((entry) => {
    const node = document.createElement("article");
    node.className = "stack-card inline-card";
    node.innerHTML = `
      <div>
        <strong>${entry.amountMl.toFixed(0)} мл</strong>
        <p class="dashboard-note">${formatTime(entry.loggedAt)}</p>
      </div>
      <button class="danger-button small-button" type="button">Удалить</button>
    `;

    node.querySelector("button").addEventListener("click", async () => {
      await request(`/api/hydration/${entry.id}`, { method: "DELETE" });
      await loadDashboard();
      showFlash("Запись воды удалена", "success");
    });

    hydrationList.append(node);
  });
}

function renderTemplates(items) {
  templatesList.innerHTML = "";
  const favoriteTemplateIds = getFavoriteIds("templates");

  if (!items.length) {
    templatesList.innerHTML =
      '<article class="stack-card"><strong>Шаблонов пока нет</strong><p class="dashboard-note">Сохраните любимый рацион, чтобы применять его в один клик.</p></article>';
    return;
  }

  items.forEach((template) => {
    const card = document.createElement("article");
    card.className = "stack-card";
    card.innerHTML = `
      <div class="stack-card-head">
        <div>
          <strong>${escapeHtml(template.name)}</strong>
          <p class="dashboard-note">${escapeHtml(template.mealType)} · использований: ${template.usageCount}</p>
        </div>
        <div class="stack-card-actions">
          <button class="ghost-button small-button template-favorite-button" type="button">
            ${favoriteTemplateIds.has(template.id) ? "Убрать из избранного" : "В избранное"}
          </button>
          <button class="ghost-button small-button template-apply-button" type="button">Применить</button>
          <button class="ghost-button small-button template-plan-button" type="button">В план</button>
          <button class="danger-button small-button template-delete-button" type="button">Удалить</button>
        </div>
      </div>
      <p class="dashboard-note">
        ${template.calories.toFixed(0)} ккал · Б ${template.protein.toFixed(1)} · Ж ${template.fat.toFixed(1)} · У ${template.carbs.toFixed(1)}
      </p>
      <p class="dashboard-note">${escapeHtml(template.notes || "Без описания")}</p>
    `;

    card.querySelector(".template-favorite-button").addEventListener("click", async () => {
      const method = favoriteTemplateIds.has(template.id) ? "DELETE" : "POST";
      await request(`/api/favorites/templates/${template.id}`, { method });
      await loadDashboard();
      renderTemplates(state.templates);
      renderFavorites();
      showFlash(
        favoriteTemplateIds.has(template.id)
          ? `Шаблон "${template.name}" убран из избранного`
          : `Шаблон "${template.name}" добавлен в избранное`,
        "success"
      );
    });

    card.querySelector(".template-apply-button").addEventListener("click", async () => {
      await request(`/api/templates/${template.id}/apply`, {
        method: "POST",
        body: JSON.stringify({
          eatenAt: nowTime(),
          date: state.selectedDate
        })
      });
      await Promise.all([loadDashboard(), loadMeals(), loadTemplates()]);
      showFlash(`Шаблон "${template.name}" применен`, "success");
    });

    card.querySelector(".template-plan-button").addEventListener("click", async () => {
      await request(`/api/planner/from-template/${template.id}`, {
        method: "POST",
        body: JSON.stringify({
          date: state.selectedDate,
          plannedTime: "13:00"
        })
      });
      await refreshPlannerViews();
      showFlash(`Шаблон "${template.name}" отправлен в планер`, "success");
    });

    card.querySelector(".template-delete-button").addEventListener("click", async () => {
      await request(`/api/templates/${template.id}`, { method: "DELETE" });
      await Promise.all([loadTemplates(), loadDashboard()]);
      showFlash(`Шаблон "${template.name}" удален`, "success");
    });

    templatesList.append(card);
  });
}

function renderRecipes(items) {
  recipesList.innerHTML = "";

  if (!items.length) {
    recipesList.innerHTML =
      '<article class="stack-card"><strong>Рецептов пока нет</strong><p class="dashboard-note">Соберите блюдо из нескольких продуктов и сохраните его как отдельный рецепт.</p></article>';
    return;
  }

  items.forEach((recipe) => {
    const ingredients = recipe.ingredients
      .map((item) => `${escapeHtml(item.productName)} · ${item.grams.toFixed(0)} г`)
      .join(" · ");
    const node = document.createElement("article");
    node.className = "stack-card";
    node.innerHTML = `
      <div class="stack-card-head">
        <div>
          <strong>${escapeHtml(recipe.title)}</strong>
          <p class="dashboard-note">${escapeHtml(recipe.mealType)} · ${recipe.totalGrams.toFixed(0)} г · ${recipe.calories.toFixed(0)} ккал</p>
        </div>
        <div class="stack-card-actions">
          <button class="ghost-button small-button recipe-apply-button" type="button">В прием</button>
          <button class="ghost-button small-button recipe-plan-button" type="button">В план</button>
          <button class="danger-button small-button recipe-delete-button" type="button">Удалить</button>
        </div>
      </div>
      <p class="dashboard-note">Состав: ${ingredients || "ингредиенты не указаны"}</p>
      <p class="dashboard-note">Б ${recipe.protein.toFixed(1)} · Ж ${recipe.fat.toFixed(1)} · У ${recipe.carbs.toFixed(1)}</p>
      <p class="dashboard-note">${escapeHtml(recipe.instructions || recipe.notes || "Без комментария")}</p>
    `;

    node.querySelector(".recipe-apply-button").addEventListener("click", async () => {
      await request(`/api/recipes/${recipe.id}/apply`, {
        method: "POST",
        body: JSON.stringify({
          date: state.selectedDate,
          eatenAt: nowTime()
        })
      });
      await Promise.all([loadDashboard(), loadMeals()]);
      showFlash(`Рецепт "${recipe.title}" добавлен в журнал`, "success");
    });

    node.querySelector(".recipe-plan-button").addEventListener("click", async () => {
      await request(`/api/recipes/${recipe.id}/plan`, {
        method: "POST",
        body: JSON.stringify({
          date: state.selectedDate,
          plannedTime: "13:00"
        })
      });
      await refreshPlannerViews();
      showFlash(`Рецепт "${recipe.title}" добавлен в план`, "success");
    });

    node.querySelector(".recipe-delete-button").addEventListener("click", async () => {
      await request(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      await Promise.all([loadRecipes(), loadDashboard()]);
      showFlash(`Рецепт "${recipe.title}" удален`, "success");
    });

    recipesList.append(node);
  });
}

function renderWeeklyPlans() {
  weeklyPlanMeta.textContent =
    `${state.weeklyPlans.length} позиций с ${formatDate(state.weeklyPlanStart)} по ${formatDate(addDays(state.weeklyPlanStart, state.weeklyPlanDays - 1))}`;
  weeklyPlanList.innerHTML = "";
  weeklyPlanForm.elements.namedItem("startDate").value = state.weeklyPlanStart;
  weeklyPlanForm.elements.namedItem("days").value = String(state.weeklyPlanDays);

  if (!state.weeklyPlans.length) {
    weeklyPlanList.innerHTML =
      '<article class="stack-card"><strong>Недельный план пока пуст</strong><p class="dashboard-note">Можно собрать его автоматически на основе шаблонов и рецептов.</p></article>';
    return;
  }

  const grouped = state.weeklyPlans.reduce((accumulator, item) => {
    if (!accumulator[item.date]) {
      accumulator[item.date] = [];
    }

    accumulator[item.date].push(item);
    return accumulator;
  }, {});

  Object.entries(grouped).forEach(([date, items]) => {
    const totalCalories = items.reduce((total, item) => total + item.targetCalories, 0);
    const node = document.createElement("article");
    node.className = "stack-card";
    node.innerHTML = `
      <div class="stack-card-head">
        <div>
          <strong>${formatDate(date)}</strong>
          <p class="dashboard-note">${items.length} слота · ${totalCalories.toFixed(0)} ккал по плану</p>
        </div>
      </div>
      <div class="weekly-plan-day-list">
        ${items
          .map(
            (item) => `
              <div class="weekly-plan-day-item">
                <span class="meal-type">${escapeHtml(item.mealType)}</span>
                <div>
                  <strong>${escapeHtml(item.title)}</strong>
                  <p class="dashboard-note">${item.plannedTime} · Б ${item.targetProtein.toFixed(1)} · Ж ${item.targetFat.toFixed(1)} · У ${item.targetCarbs.toFixed(1)}</p>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;
    weeklyPlanList.append(node);
  });
}

function renderProducts(products) {
  productsList.innerHTML = "";
  productsMeta.textContent = `${products.length} продуктов в справочнике`;
  const favoriteProductIds = getFavoriteIds("products");

  if (!products.length) {
    productsList.innerHTML =
      '<article class="product-card"><p class="muted-text">Ничего не найдено по текущему запросу.</p></article>';
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("article");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <div class="product-card-head">
        <div class="product-card-title-wrap">
          <div class="product-title-row">
            <h3 class="product-title">${escapeHtml(product.name)}</h3>
            <span class="product-measure">на 100 г</span>
          </div>
          <div class="product-meta-row">
            <span class="info-badge">${escapeHtml(product.brand || "Без бренда")}</span>
            <span class="info-badge info-badge-muted">${escapeHtml(product.category)}</span>
          </div>
        </div>
      </div>
      <div class="product-macro-grid">
        <article class="product-macro-card">
          <span>Калории</span>
          <strong>${product.calories.toFixed(1)}</strong>
        </article>
        <article class="product-macro-card">
          <span>Белки</span>
          <strong>${product.protein.toFixed(1)} г</strong>
        </article>
        <article class="product-macro-card">
          <span>Жиры</span>
          <strong>${product.fat.toFixed(1)} г</strong>
        </article>
        <article class="product-macro-card">
          <span>Углеводы</span>
          <strong>${product.carbs.toFixed(1)} г</strong>
        </article>
      </div>
      <div class="product-actions">
        <button class="ghost-button small-button product-favorite-button" type="button">
          ${favoriteProductIds.has(product.id) ? "Убрать из избранного" : "В избранное"}
        </button>
        <button class="ghost-button small-button product-fill-button" type="button">Заполнить форму</button>
        <button class="ghost-button small-button product-shopping-button" type="button">Добавить в покупки</button>
        ${
          state.user?.role === "admin"
            ? '<button class="danger-button small-button product-delete-button" type="button">Удалить</button>'
            : ""
        }
      </div>
    `;

    productCard
      .querySelector(".product-favorite-button")
      .addEventListener("click", async () => {
        const method = favoriteProductIds.has(product.id) ? "DELETE" : "POST";
        await request(`/api/favorites/products/${product.id}`, { method });
        await loadDashboard();
        renderProducts(state.products);
        renderFavorites();
        showFlash(
          favoriteProductIds.has(product.id)
            ? `Продукт "${product.name}" убран из избранного`
            : `Продукт "${product.name}" добавлен в избранное`,
          "success"
        );
      });

    productCard.querySelector(".product-fill-button").addEventListener("click", () => {
      fillMealFormFromSource(
        {
          ...product,
          grams: 100,
          mealType: "Перекус",
          notes: `Источник: ${product.name}`
        },
        product.name
      );
      showFlash(`Продукт "${product.name}" перенесен в форму`, "success");
    });

    productCard
      .querySelector(".product-shopping-button")
      .addEventListener("click", async () => {
        await addProductToShopping(product.id, product.name);
      });

    if (state.user?.role === "admin") {
      productCard.querySelector(".product-delete-button").addEventListener("click", async () => {
        await request(`/api/products/${product.id}`, { method: "DELETE" });
        await Promise.all([loadProducts(), loadDashboard()]);
        showFlash(`Продукт "${product.name}" удален`, "success");
      });
    }

    productsList.append(productCard);
  });
}

function renderMeals(meals) {
  mealsList.innerHTML = "";
  const suffix =
    state.currentMealType === "Все" ? "за день" : `по фильтру "${state.currentMealType}"`;
  mealCount.textContent = `${meals.length} записей ${suffix}`;

  if (!meals.length) {
    mealsList.innerHTML =
      '<article class="meal-card"><p class="muted-text">По выбранному фильтру записей нет. Попробуйте другой тип или создайте шаблон.</p></article>';
    return;
  }

  meals.forEach((meal) => {
    const item = mealItemTemplate.content.firstElementChild.cloneNode(true);
    item.querySelector(".meal-title").textContent = meal.title;
    item.querySelector(".meal-type").textContent = meal.mealType;
    item.querySelector(".meal-meta").textContent =
      `${formatDate(meal.date)} · ${formatTime(meal.eatenAt)} · ${meal.grams} г`;

    item.querySelector(".meal-kbju").innerHTML = `
      <article class="meal-macro-card">
        <span>Калории</span>
        <strong>${meal.calories.toFixed(0)} ккал</strong>
      </article>
      <article class="meal-macro-card">
        <span>Белки</span>
        <strong>${meal.protein.toFixed(1)} г</strong>
      </article>
      <article class="meal-macro-card">
        <span>Жиры</span>
        <strong>${meal.fat.toFixed(1)} г</strong>
      </article>
      <article class="meal-macro-card">
        <span>Углеводы</span>
        <strong>${meal.carbs.toFixed(1)} г</strong>
      </article>
    `;

    const mealNote = item.querySelector(".meal-note");
    if (meal.notes) {
      mealNote.textContent = meal.notes;
      mealNote.classList.remove("hidden");
    } else {
      mealNote.textContent = "";
      mealNote.classList.add("hidden");
    }

    const actions = item.querySelector(".meal-actions");
    actions.innerHTML = `
      <button class="ghost-button small-button save-template-button" type="button">В шаблон</button>
      <button class="ghost-button small-button save-plan-button" type="button">В план</button>
      <button class="danger-button small-button delete-meal-button" type="button">Удалить</button>
    `;

    actions.querySelector(".save-template-button").addEventListener("click", async () => {
      await request(`/api/templates/from-meal/${meal.id}`, {
        method: "POST",
        body: JSON.stringify({
          name: `${meal.title} шаблон`
        })
      });
      await Promise.all([loadTemplates(), loadDashboard()]);
      showFlash(`Запись "${meal.title}" сохранена в шаблоны`, "success");
    });

    actions.querySelector(".save-plan-button").addEventListener("click", () => {
      fillPlannerFormFromSource(meal, meal.title);
      showFlash(`Запись "${meal.title}" перенесена в планер`, "info");
    });

    actions.querySelector(".delete-meal-button").addEventListener("click", async () => {
      await request(`/api/meals/${meal.id}`, { method: "DELETE" });
      await Promise.all([loadDashboard(), loadMeals()]);
      showFlash(`Запись "${meal.title}" удалена`, "success");
    });

    mealsList.append(item);
  });
}

function renderFilters() {
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mealFilter === state.currentMealType);
  });
}

function renderHero(dashboard) {
  const latestMeal = dashboard.meals[dashboard.meals.length - 1];
  const focus = getFocus(dashboard);

  heroCalories.textContent = `${dashboard.summary.totals.calories.toFixed(0)} ккал`;
  heroCaloriesCaption.textContent =
    `${Math.round(dashboard.summary.progress.calories)}% дневной цели · осталось ${dashboard.summary.remaining.calories.toFixed(0)} ккал`;
  heroCaloriesBar.style.width = `${Math.min(dashboard.summary.progress.calories, 100)}%`;
  heroMealsCount.textContent = String(dashboard.metadata.totalMeals);
  heroLastMeal.textContent = latestMeal
    ? `${latestMeal.mealType}: ${latestMeal.title} в ${latestMeal.eatenAt}`
    : "На выбранную дату еще нет записей";
  heroFocusTitle.textContent = focus.title;
  heroFocusText.textContent = focus.text;
  heroUpdatedAt.textContent = "Данные синхронизированы с сервером";
  heroDateLabel.textContent = formatDate(dashboard.date);
  heroStorage.textContent = getStorageLabel(dashboard.metadata);
  heroUserName.textContent = dashboard.user.name;
  heroUserRole.textContent =
    dashboard.user.role === "admin" ? "Роль: администратор" : "Роль: пользователь";
  currentDateLabel.textContent = `Выбранная дата: ${formatDate(dashboard.date)}`;
  sessionUserName.textContent = `${dashboard.user.name} · ${dashboard.user.role}`;
  heroSmartScore.textContent = dashboard.smartScore.total.toFixed(1);
  heroSmartScoreCaption.textContent = "Сводная оценка по выбранной дате";
  heroStreak.textContent = `${dashboard.streak} дней`;
  heroStreakCaption.textContent = "Сколько дней подряд ведется дневник";
}

function renderWellbeing(wellbeing) {
  wellbeingReadinessScore.textContent = wellbeing.readinessScore.toFixed(1);
  wellbeingReadinessCaption.textContent = wellbeing.entry
    ? `Настроение ${wellbeing.entry.mood}/5 · Энергия ${wellbeing.entry.energy}/5 · Сон ${wellbeing.entry.sleepHours.toFixed(1)} ч`
    : "На выбранную дату оценка самочувствия еще не заполнена.";

  if (wellbeing.entry) {
    setFormValues(checkinForm, wellbeing.entry);
  } else {
    checkinForm.reset();
    setFormValues(checkinForm, {
      mood: 4,
      energy: 4,
      stress: 2,
      hunger: 3,
      sleepHours: 7.5
    });
  }

  wellbeingTrend.innerHTML = "";

  wellbeing.trend.forEach((entry) => {
    const node = document.createElement("article");
    node.className = "stack-card";
    node.innerHTML = `
      <p class="dashboard-label">${formatShortDate(entry.date)}</p>
      <strong>${entry.readiness.toFixed(1)}</strong>
      <p class="dashboard-note">Настроение ${entry.mood}/5 · Энергия ${entry.energy}/5 · Стресс ${entry.stress}/5</p>
    `;
    wellbeingTrend.append(node);
  });
}

function renderBodyMetrics(metrics) {
  bodyMetricsSummary.innerHTML = "";

  const summaryItems = [
    {
      title: "Текущий вес",
      value: metrics.latest ? `${metrics.latest.weightKg.toFixed(1)} кг` : "—"
    },
    {
      title: "Дельта",
      value: metrics.latest && metrics.previous ? `${metrics.deltaWeight.toFixed(1)} кг` : "—"
    },
    {
      title: "Жир",
      value: metrics.latest?.bodyFat ? `${metrics.latest.bodyFat.toFixed(1)}%` : "—"
    },
    {
      title: "Талия",
      value: metrics.latest?.waistCm ? `${metrics.latest.waistCm.toFixed(1)} см` : "—"
    }
  ];

  summaryItems.forEach((item) => {
    const node = document.createElement("article");
    node.className = "stack-card";
    node.innerHTML = `
      <p class="dashboard-label">${escapeHtml(item.title)}</p>
      <strong>${escapeHtml(item.value)}</strong>
    `;
    bodyMetricsSummary.append(node);
  });

  bodyMetricsList.innerHTML = "";

  if (!metrics.entries.length) {
    bodyMetricsList.innerHTML =
      '<article class="stack-card"><p class="dashboard-note">История замеров пока пуста.</p></article>';
    return;
  }

  metrics.entries.forEach((entry) => {
    const node = document.createElement("article");
    node.className = "stack-card";
    node.innerHTML = `
      <div class="stack-card-head">
        <div>
          <strong>${entry.weightKg.toFixed(1)} кг · ${formatDate(entry.date)}</strong>
          <p class="dashboard-note">Жир ${entry.bodyFat ?? "—"} · Талия ${entry.waistCm ?? "—"} · Грудь ${entry.chestCm ?? "—"}</p>
        </div>
        <button class="danger-button small-button" type="button">Удалить</button>
      </div>
      <p class="dashboard-note">${escapeHtml(entry.notes || "Без комментария")}</p>
    `;

    node.querySelector("button").addEventListener("click", async () => {
      await request(`/api/metrics/${entry.id}`, { method: "DELETE" });
      await Promise.all([loadMetrics(), loadDashboard()]);
      showFlash("Замер удален", "success");
    });

    bodyMetricsList.append(node);
  });
}

function renderPlanner(planner) {
  plannerMeta.textContent =
    `${planner.totals.planned} слотов · выполнено ${planner.totals.completed} · ${Math.round(planner.completionRate)}%`;
  plannerList.innerHTML = "";
  plannerForm.elements.namedItem("date").value = state.selectedDate;

  if (!planner.items.length) {
    plannerList.innerHTML =
      '<article class="stack-card"><strong>На выбранную дату план пуст</strong><p class="dashboard-note">Можно создать план вручную или отправить туда шаблон.</p></article>';
    return;
  }

  planner.items.forEach((item) => {
    const node = document.createElement("article");
    node.className = "stack-card";
    node.innerHTML = `
      <div class="stack-card-head">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p class="dashboard-note">${escapeHtml(item.mealType)} · ${item.plannedTime} · ${item.targetCalories.toFixed(0)} ккал</p>
        </div>
        <div class="stack-card-actions">
          <button class="ghost-button small-button planner-toggle-button" type="button">
            ${item.completed ? "Снять" : "Готово"}
          </button>
          <button class="danger-button small-button planner-delete-button" type="button">Удалить</button>
        </div>
      </div>
      <p class="dashboard-note">Б ${item.targetProtein.toFixed(1)} · Ж ${item.targetFat.toFixed(1)} · У ${item.targetCarbs.toFixed(1)}</p>
    `;

    node.querySelector(".planner-toggle-button").addEventListener("click", async () => {
      await request(`/api/planner/${item.id}/completion`, {
        method: "PATCH",
        body: JSON.stringify({
          completed: !item.completed
        })
      });
      await Promise.all([loadDashboard(), loadWeeklyPlans()]);
      showFlash("Статус плана обновлен", "success");
    });

    node.querySelector(".planner-delete-button").addEventListener("click", async () => {
      await request(`/api/planner/${item.id}`, { method: "DELETE" });
      await Promise.all([loadDashboard(), loadWeeklyPlans()]);
      showFlash("Позиция плана удалена", "success");
    });

    plannerList.append(node);
  });
}

function renderShopping(shopping) {
  shoppingMeta.textContent =
    `${shopping.summary.total} позиций · активных ${shopping.summary.pending} · закрытых ${shopping.summary.checked}`;
  shoppingList.innerHTML = "";

  if (!shopping.items.length) {
    shoppingList.innerHTML =
      '<article class="stack-card"><strong>Список покупок пуст</strong><p class="dashboard-note">Добавляйте базовые продукты вручную или прямо из каталога.</p></article>';
    return;
  }

  shopping.items.forEach((item) => {
    const node = document.createElement("article");
    node.className = "stack-card";
    node.innerHTML = `
      <div class="stack-card-head">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p class="dashboard-note">${escapeHtml(item.category)} · ${item.quantity} ${escapeHtml(item.unit)} · ${item.checked ? "куплено" : "в работе"}</p>
        </div>
        <div class="stack-card-actions">
          <button class="ghost-button small-button shopping-check-button" type="button">
            ${item.checked ? "Вернуть" : "Куплено"}
          </button>
          <button class="danger-button small-button shopping-delete-button" type="button">Удалить</button>
        </div>
      </div>
      <p class="dashboard-note">${escapeHtml(item.notes || "Без комментария")}</p>
    `;

    node.querySelector(".shopping-check-button").addEventListener("click", async () => {
      await request(`/api/shopping/${item.id}/check`, {
        method: "PATCH",
        body: JSON.stringify({
          checked: !item.checked
        })
      });
      await Promise.all([loadShopping(), loadDashboard()]);
      showFlash("Статус покупки обновлен", "success");
    });

    node.querySelector(".shopping-delete-button").addEventListener("click", async () => {
      await request(`/api/shopping/${item.id}`, { method: "DELETE" });
      await Promise.all([loadShopping(), loadDashboard()]);
      showFlash("Позиция удалена из списка покупок", "success");
    });

    shoppingList.append(node);
  });
}

function renderGoalPresets() {
  goalPresetsList.innerHTML = "";

  state.goalPresets.forEach((preset) => {
    const node = document.createElement("button");
    node.className = "filter-chip goal-preset-chip";
    node.type = "button";
    node.innerHTML = `
      <strong>${escapeHtml(preset.name)}</strong>
      <span>${preset.calories} ккал · Б ${preset.protein} · Ж ${preset.fat} · У ${preset.carbs}</span>
    `;
    node.addEventListener("click", async () => {
      await request(`/api/goals/presets/${preset.id}/apply`, {
        method: "POST",
        body: JSON.stringify({})
      });
      await loadDashboard();
      showFlash(`Пресет "${preset.name}" применен`, "success");
    });
    goalPresetsList.append(node);
  });
}

function renderFavorites() {
  const favorites = state.dashboard?.favorites || { products: [], templates: [] };
  favoriteProductsList.innerHTML = "";
  favoriteTemplatesList.innerHTML = "";

  if (!favorites.products.length) {
    favoriteProductsList.innerHTML =
      '<article class="stack-card"><p class="dashboard-note">Добавляйте продукты в избранное из каталога, чтобы собирать приемы пищи быстрее.</p></article>';
  } else {
    favorites.products.forEach((product) => {
      const node = document.createElement("article");
      node.className = "stack-card";
      node.innerHTML = `
        <div class="stack-card-head">
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <p class="dashboard-note">${escapeHtml(product.brand || "Без бренда")} · ${escapeHtml(product.category)}</p>
          </div>
          <div class="stack-card-actions">
            <button class="ghost-button small-button favorite-fill-button" type="button">В форму</button>
            <button class="ghost-button small-button favorite-shopping-button" type="button">В покупки</button>
            <button class="danger-button small-button favorite-remove-button" type="button">Убрать</button>
          </div>
        </div>
      `;

      node.querySelector(".favorite-fill-button").addEventListener("click", () => {
        fillMealFormFromSource(
          {
            ...product,
            grams: 100,
            mealType: "Перекус",
            notes: `Источник: избранное · ${product.name}`
          },
          product.name
        );
        showFlash(`Избранный продукт "${product.name}" перенесен в форму`, "success");
      });
      node.querySelector(".favorite-shopping-button").addEventListener("click", async () => {
        await addProductToShopping(product.id, product.name, {
          notes: "Добавлено из избранных продуктов"
        });
      });
      node.querySelector(".favorite-remove-button").addEventListener("click", async () => {
        await request(`/api/favorites/products/${product.id}`, { method: "DELETE" });
        await loadDashboard();
        renderProducts(state.products);
        showFlash(`"${product.name}" убран из избранного`, "info");
      });

      favoriteProductsList.append(node);
    });
  }

  if (!favorites.templates.length) {
    favoriteTemplatesList.innerHTML =
      '<article class="stack-card"><p class="dashboard-note">Любимые шаблоны помогут быстро собирать день и переносить слоты в план.</p></article>';
  } else {
    favorites.templates.forEach((template) => {
      const node = document.createElement("article");
      node.className = "stack-card";
      node.innerHTML = `
        <div class="stack-card-head">
          <div>
            <strong>${escapeHtml(template.name)}</strong>
            <p class="dashboard-note">${escapeHtml(template.mealType)} · ${template.calories.toFixed(0)} ккал</p>
          </div>
          <div class="stack-card-actions">
            <button class="ghost-button small-button favorite-template-apply" type="button">Применить</button>
            <button class="ghost-button small-button favorite-template-plan" type="button">В план</button>
            <button class="danger-button small-button favorite-template-remove" type="button">Убрать</button>
          </div>
        </div>
        <p class="dashboard-note">${escapeHtml(template.notes || "Без описания")}</p>
      `;

      node.querySelector(".favorite-template-apply").addEventListener("click", async () => {
        await request(`/api/templates/${template.id}/apply`, {
          method: "POST",
          body: JSON.stringify({
            eatenAt: nowTime(),
            date: state.selectedDate
          })
        });
        await Promise.all([loadDashboard(), loadMeals(), loadTemplates()]);
        showFlash(`Шаблон "${template.name}" применен из избранного`, "success");
      });
      node.querySelector(".favorite-template-plan").addEventListener("click", async () => {
        await request(`/api/planner/from-template/${template.id}`, {
          method: "POST",
          body: JSON.stringify({
            date: state.selectedDate,
            plannedTime: "13:00"
          })
        });
        await refreshPlannerViews();
        showFlash(`Шаблон "${template.name}" отправлен в план`, "success");
      });
      node.querySelector(".favorite-template-remove").addEventListener("click", async () => {
        await request(`/api/favorites/templates/${template.id}`, { method: "DELETE" });
        await loadDashboard();
        renderTemplates(state.templates);
        showFlash(`"${template.name}" убран из избранного`, "info");
      });

      favoriteTemplatesList.append(node);
    });
  }
}

function renderDayNote() {
  const dayNote = state.dashboard?.dayNote;
  const recentNotes = state.dashboard?.recentDayNotes || [];

  if (!dayNote) {
    return;
  }

  dayNoteForm.reset();
  setFormValues(dayNoteForm, dayNote);
  dayNotePreview.innerHTML = "";
  recentDayNotes.innerHTML = "";

  if (!dayNote.hasContent) {
    dayNotePreview.innerHTML =
      '<article class="stack-card"><strong>На дату пока нет заметки</strong><p class="dashboard-note">Добавьте фокус дня, выводы или организационные комментарии.</p></article>';
  } else {
    dayNotePreview.innerHTML = `
      <article class="stack-card">
        <p class="dashboard-label">${formatDate(dayNote.date)}</p>
        <strong>${escapeHtml(dayNote.title || "Рабочая заметка")}</strong>
        <p class="dashboard-note">${escapeHtml(dayNote.focus || "Фокус не указан")}</p>
        <p class="dashboard-note">Что удалось: ${escapeHtml(dayNote.wins || "—")}</p>
        <p class="dashboard-note">Что улучшить: ${escapeHtml(dayNote.improvements || "—")}</p>
        <p class="dashboard-note">${escapeHtml(dayNote.notes || "Без комментария")}</p>
      </article>
    `;
  }

  if (!recentNotes.length) {
    recentDayNotes.innerHTML =
      '<article class="stack-card"><p class="dashboard-note">Архив заметок появится после нескольких заполненных дней.</p></article>';
    return;
  }

  recentNotes.forEach((note) => {
    const node = document.createElement("article");
    node.className = "stack-card";
    node.innerHTML = `
      <p class="dashboard-label">${formatDate(note.date)}</p>
      <strong>${escapeHtml(note.title || "Рабочая заметка")}</strong>
      <p class="dashboard-note">${escapeHtml(note.focus || note.notes || "Без деталей")}</p>
    `;
    recentDayNotes.append(node);
  });
}

function renderDashboardSnapshot() {
  if (!state.dashboard) {
    return;
  }

  state.user = state.dashboard.user;
  state.selectedDate = state.dashboard.date;
  syncDateControls();
  setFormValues(goalsForm, state.dashboard.goals);
  renderHero(state.dashboard);
  renderSummary(state.dashboard.summary, state.dashboard.goals);
  renderInsights(state.dashboard);
  renderWeeklyTrend(state.dashboard.weeklyTrend);
  renderComparison(state.dashboard.comparison);
  renderDailyControls(state.dashboard.dailyControls);
  renderAchievements(state.dashboard.achievements);
  renderRecommendations(state.dashboard.recommendations);
  renderScoreBreakdown(state.dashboard.smartScore);
  renderVisualizations(state.dashboard);
  renderHydration(state.dashboard.hydration);
  renderWellbeing(state.dashboard.wellbeing);
  renderPlanner(state.dashboard.planner);
  renderDayNote();
  renderFavorites();
  if (state.products.length) {
    renderProducts(state.products);
  }
  if (state.templates.length) {
    renderTemplates(state.templates);
  }
  productAdminPanel.classList.toggle("hidden", state.user.role !== "admin");
}

async function loadProducts() {
  const query = state.productSearch
    ? `?search=${encodeURIComponent(state.productSearch)}`
    : "";
  state.products = await request(`/api/products${query}`, {}, false);
  renderProducts(state.products);
  renderRecipeIngredientRows();
}

async function loadTemplates() {
  state.templates = await request("/api/templates");
  renderTemplates(state.templates);
}

async function loadRecipes() {
  state.recipes = await request("/api/recipes");
  renderRecipes(state.recipes);
}

async function loadGoalPresets() {
  state.goalPresets = await request("/api/goals/presets");
  renderGoalPresets();
}

async function loadMeals() {
  const query = new URLSearchParams({
    date: state.selectedDate
  });

  if (state.currentMealType !== "Все") {
    query.set("mealType", state.currentMealType);
  }

  state.meals = await request(`/api/meals?${query.toString()}`);
  renderMeals(state.meals);
  renderFilters();
}

async function loadDashboard() {
  state.dashboard = await request(`/api/dashboard?date=${encodeURIComponent(state.selectedDate)}`);
  renderDashboardSnapshot();
}

async function loadMetrics() {
  state.metrics = await request("/api/metrics");
  renderBodyMetrics(state.metrics);
}

async function loadShopping() {
  state.shopping = await request("/api/shopping");
  renderShopping(state.shopping);
}

async function loadWeeklyPlans() {
  const endDate = addDays(state.weeklyPlanStart, state.weeklyPlanDays - 1);
  const query = new URLSearchParams({
    dateFrom: state.weeklyPlanStart,
    dateTo: endDate
  });
  state.weeklyPlans = await request(`/api/planner?${query.toString()}`);
  renderWeeklyPlans();
}

async function refreshWorkspace() {
  await loadDashboard();

  const optionalSections = await Promise.allSettled([
    loadGoalPresets(),
    loadMeals(),
    loadProducts(),
    loadRecipes(),
    loadTemplates(),
    loadMetrics(),
    loadShopping(),
    loadWeeklyPlans()
  ]);
  const failedSections = optionalSections.filter((result) => result.status === "rejected");

  failedSections.forEach((result) => {
    console.error(result.reason);
  });

  scheduleActiveSectionSync();
  setApiStatus(
    failedSections.length
      ? `Система онлайн · ${failedSections.length} раздел(ов) требуют обновления`
      : "Система онлайн"
  );

  if (failedSections.length) {
    showFlash("Часть разделов не загрузилась. Основная сводка доступна.", "error");
  }
}

async function bootstrapSession() {
  setTheme(state.theme);
  setApiStatus("Проверка системы...");
  syncDateControls();
  setFieldValue(mealForm, "eatenAt", nowTime());
  setFieldValue(weeklyPlanForm, "startDate", state.weeklyPlanStart);

  if (!state.token) {
    showAuth();
    return;
  }

  try {
    await request("/api/auth/me");
    showApp();
    await refreshWorkspace();
  } catch (error) {
    setApiStatus("Нужен вход");
    showAuth(error.message);
  }
}

async function exportReport(format) {
  if (format === "json") {
    const report = await fetchDailyReport();
    downloadTextFile(
      `ration-report-${state.selectedDate}.json`,
      `${JSON.stringify(report, null, 2)}\n`,
      "application/json;charset=utf-8"
    );
    return;
  }

  if (format === "pdf") {
    const report = await fetchDailyReport();
    openPrintableReport(report);
    return;
  }

  const response = await fetch(
    `/api/exports/daily-report?format=${format}&date=${encodeURIComponent(state.selectedDate)}`,
    {
      headers: {
        Authorization: `Bearer ${state.token}`
      }
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Не удалось выполнить экспорт");
  }

  const content = await response.text();
  downloadTextFile(`ration-report-${state.selectedDate}.csv`, content, "text/csv;charset=utf-8");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = await request(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: loginForm.elements.namedItem("email").value.trim(),
          password: loginForm.elements.namedItem("password").value
        })
      },
      false
    );

    setToken(payload.token);
    showApp();
    try {
      await refreshWorkspace();
      showFlash("Вход выполнен", "success");
    } catch (error) {
      setApiStatus("Ошибка загрузки данных");
      renderWorkspaceLoadError(error);
      reportClientError(error, "Вход выполнен, но данные не загрузились.");
    }
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = await request(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          name: registerForm.elements.namedItem("name").value.trim(),
          email: registerForm.elements.namedItem("email").value.trim(),
          password: registerForm.elements.namedItem("password").value
        })
      },
      false
    );

    setToken(payload.token);
    showApp();
    try {
      await refreshWorkspace();
      showFlash("Аккаунт создан", "success");
    } catch (error) {
      setApiStatus("Ошибка загрузки данных");
      renderWorkspaceLoadError(error);
      reportClientError(error, "Аккаунт создан, но данные не загрузились.");
    }
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

logoutButton.addEventListener("click", () => {
  clearSession();
  showAuth("Вы вышли из системы.");
  showFlash("Сессия завершена", "info");
});

themeToggle.addEventListener("click", () => {
  setTheme(state.theme === "dark" ? "light" : "dark");
});

exportJsonButton.addEventListener("click", async () => {
  try {
    await exportReport("json");
    showFlash("JSON-отчет выгружен", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
});

exportCsvButton.addEventListener("click", async () => {
  try {
    await exportReport("csv");
    showFlash("CSV-отчет выгружен", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
});

exportPdfButton.addEventListener("click", async () => {
  try {
    await exportReport("pdf");
    showFlash("Открыт печатный отчет. Его можно сохранить как PDF.", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
});

panelExportButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await exportReport(button.dataset.exportFormat);
      const label =
        button.dataset.exportFormat === "pdf"
          ? "Открыт печатный отчет для PDF."
          : `${button.dataset.exportFormat.toUpperCase()}-отчет подготовлен`;
      showFlash(label, "success");
    } catch (error) {
      showFlash(error.message, "error");
    }
  });
});

if (importFileInput) {
  importFileInput.addEventListener("change", () => {
    const file = importFileInput.files?.[0];
    importFileMeta.textContent = file
      ? `Файл: ${file.name} · ${(file.size / 1024).toFixed(1)} КБ`
      : "Поддерживаются JSON, CSV и TSV.";
    clearImportPreview();
  });
}

if (importRawInput) {
  importRawInput.addEventListener("input", () => {
    if (importRawInput.value.trim()) {
      importFileMeta.textContent = `Вставка данных · ${importRawInput.value.trim().length} символов`;
    }
    clearImportPreview();
  });
}

[importDatasetSelect, importFormatSelect].forEach((field) => {
  field?.addEventListener("change", () => {
    clearImportPreview();
  });
});

downloadImportTemplateButton?.addEventListener("click", async () => {
  try {
    await downloadImportTemplate();
    showFlash("Шаблон файла загружен", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
});

importForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    importPreviewButton.disabled = true;
    const content = await readImportContent();
    const preview = await request("/api/imports/preview", {
      method: "POST",
      body: JSON.stringify(buildImportPayload(content))
    });
    renderImportPreview(preview);
    showFlash("Предпросмотр импорта готов", "success");
  } catch (error) {
    clearImportPreview();
    showFlash(error.message, "error");
  } finally {
    importPreviewButton.disabled = false;
  }
});

importApplyButton?.addEventListener("click", async () => {
  try {
    importApplyButton.disabled = true;
    const content = await readImportContent();
    const payload = buildImportPayload(content);
    const result = await request("/api/imports/apply", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    await refreshAfterImport(payload.dataset);
    clearImportPreview();
    if (importRawInput) {
      importRawInput.value = "";
    }
    if (importFileInput) {
      importFileInput.value = "";
    }
    importFileMeta.textContent = "Поддерживаются JSON, CSV и TSV.";
    showFlash(
      `Импорт завершен: ${result.imported} строк загружено, ${result.skipped} пропущено.`,
      "success"
    );
  } catch (error) {
    showFlash(error.message, "error");
  } finally {
    importApplyButton.disabled = false;
  }
});

goalsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  await request("/api/goals", {
    method: "PUT",
    body: JSON.stringify({
      calories: toNumber(goalsForm, "calories"),
      protein: toNumber(goalsForm, "protein"),
      fat: toNumber(goalsForm, "fat"),
      carbs: toNumber(goalsForm, "carbs")
    })
  });

  await loadDashboard();
  showFlash("Цели обновлены", "success");
});

mealForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  await request("/api/meals", {
    method: "POST",
    body: JSON.stringify({
      title: mealForm.elements.namedItem("title").value.trim(),
      mealType: mealForm.elements.namedItem("mealType").value,
      date: state.selectedDate,
      eatenAt: mealForm.elements.namedItem("eatenAt").value,
      grams: toNumber(mealForm, "grams"),
      calories: toNumber(mealForm, "calories"),
      protein: toNumber(mealForm, "protein"),
      fat: toNumber(mealForm, "fat"),
      carbs: toNumber(mealForm, "carbs"),
      notes: mealForm.elements.namedItem("notes").value.trim()
    })
  });

  mealForm.reset();
  mealForm.elements.namedItem("mealType").value = "Завтрак";
  mealForm.elements.namedItem("eatenAt").value = nowTime();
  await Promise.all([loadDashboard(), loadMeals()]);
  showFlash("Прием пищи добавлен", "success");
});

templateForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  await request("/api/templates", {
    method: "POST",
    body: JSON.stringify({
      name: templateForm.elements.namedItem("name").value.trim(),
      mealType: templateForm.elements.namedItem("mealType").value,
      grams: toNumber(templateForm, "grams"),
      calories: toNumber(templateForm, "calories"),
      protein: toNumber(templateForm, "protein"),
      fat: toNumber(templateForm, "fat"),
      carbs: toNumber(templateForm, "carbs"),
      notes: templateForm.elements.namedItem("notes").value.trim()
    })
  });

  templateForm.reset();
  templateForm.elements.namedItem("mealType").value = "Завтрак";
  await Promise.all([loadTemplates(), loadDashboard()]);
  showFlash("Шаблон сохранен", "success");
});

if (productForm) {
  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    await request("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: productForm.elements.namedItem("name").value.trim(),
        brand: productForm.elements.namedItem("brand").value.trim(),
        category: productForm.elements.namedItem("category").value,
        calories: toNumber(productForm, "calories"),
        protein: toNumber(productForm, "protein"),
        fat: toNumber(productForm, "fat"),
        carbs: toNumber(productForm, "carbs")
      })
    });

    productForm.reset();
    productForm.elements.namedItem("category").value = "Белковые продукты";
    await loadProducts();
    showFlash("Продукт добавлен", "success");
  });
}

checkinForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  await request("/api/checkins", {
    method: "PUT",
    body: JSON.stringify({
      date: state.selectedDate,
      mood: toNumber(checkinForm, "mood"),
      energy: toNumber(checkinForm, "energy"),
      stress: toNumber(checkinForm, "stress"),
      hunger: toNumber(checkinForm, "hunger"),
      sleepHours: toNumber(checkinForm, "sleepHours"),
      notes: checkinForm.elements.namedItem("notes").value.trim()
    })
  });

  await loadDashboard();
  showFlash("Оценка самочувствия сохранена", "success");
});

bodyMetricForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  await request("/api/metrics", {
    method: "POST",
    body: JSON.stringify({
      date: state.selectedDate,
      weightKg: toNumber(bodyMetricForm, "weightKg"),
      bodyFat: toNumber(bodyMetricForm, "bodyFat"),
      waistCm: toNumber(bodyMetricForm, "waistCm"),
      chestCm: toNumber(bodyMetricForm, "chestCm"),
      notes: bodyMetricForm.elements.namedItem("notes").value.trim()
    })
  });

  bodyMetricForm.reset();
  await Promise.all([loadMetrics(), loadDashboard()]);
  showFlash("Замер тела добавлен", "success");
});

plannerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  await request("/api/planner", {
    method: "POST",
    body: JSON.stringify({
      title: plannerForm.elements.namedItem("title").value.trim(),
      mealType: plannerForm.elements.namedItem("mealType").value,
      date: plannerForm.elements.namedItem("date").value,
      plannedTime: plannerForm.elements.namedItem("plannedTime").value,
      targetCalories: toNumber(plannerForm, "targetCalories"),
      targetProtein: toNumber(plannerForm, "targetProtein"),
      targetFat: toNumber(plannerForm, "targetFat"),
      targetCarbs: toNumber(plannerForm, "targetCarbs")
    })
  });

  plannerForm.reset();
  plannerForm.elements.namedItem("mealType").value = "Завтрак";
  plannerForm.elements.namedItem("date").value = state.selectedDate;
  plannerForm.elements.namedItem("plannedTime").value = "13:00";
  await Promise.all([loadDashboard(), loadWeeklyPlans()]);
  showFlash("Позиция добавлена в планер", "success");
});

recipeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  await request("/api/recipes", {
    method: "POST",
    body: JSON.stringify({
      title: recipeForm.elements.namedItem("title").value.trim(),
      mealType: recipeForm.elements.namedItem("mealType").value,
      notes: recipeForm.elements.namedItem("notes").value.trim(),
      instructions: recipeForm.elements.namedItem("instructions").value.trim(),
      ingredients: collectRecipeIngredients()
    })
  });

  resetRecipeDraft();
  await loadRecipes();
  showFlash("Рецепт сохранен", "success");
});

weeklyPlanForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  state.weeklyPlanStart =
    weeklyPlanForm.elements.namedItem("startDate").value || state.selectedDate;
  state.weeklyPlanDays = Number(weeklyPlanForm.elements.namedItem("days").value) || 7;

  await request("/api/planner/generate-week", {
    method: "POST",
    body: JSON.stringify({
      startDate: state.weeklyPlanStart,
      days: state.weeklyPlanDays,
      includeSnack: weeklyPlanForm.elements.namedItem("includeSnack").checked,
      replaceExisting: weeklyPlanForm.elements.namedItem("replaceExisting").checked
    })
  });

  await Promise.all([loadDashboard(), loadWeeklyPlans()]);
  showFlash("Недельный план собран", "success");
});

shoppingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  await request("/api/shopping", {
    method: "POST",
    body: JSON.stringify({
      title: shoppingForm.elements.namedItem("title").value.trim(),
      category: shoppingForm.elements.namedItem("category").value.trim(),
      quantity: toNumber(shoppingForm, "quantity"),
      unit: shoppingForm.elements.namedItem("unit").value,
      plannedFor: state.selectedDate,
      notes: shoppingForm.elements.namedItem("notes").value.trim()
    })
  });

  shoppingForm.reset();
  shoppingForm.elements.namedItem("unit").value = "шт";
  await Promise.all([loadShopping(), loadDashboard()]);
  showFlash("Позиция добавлена в список покупок", "success");
});

dayNoteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  await request("/api/day-notes", {
    method: "PUT",
    body: JSON.stringify({
      date: state.selectedDate,
      title: dayNoteForm.elements.namedItem("title").value.trim(),
      focus: dayNoteForm.elements.namedItem("focus").value.trim(),
      wins: dayNoteForm.elements.namedItem("wins").value.trim(),
      improvements: dayNoteForm.elements.namedItem("improvements").value.trim(),
      notes: dayNoteForm.elements.namedItem("notes").value.trim()
    })
  });

  await loadDashboard();
  showFlash("Заметка дня сохранена", "success");
});

productSearchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  state.productSearch = productSearchInput.value.trim();
  await loadProducts();
  renderRecipeIngredientRows();
});

addRecipeIngredientButton.addEventListener("click", () => {
  state.recipeDraftIngredients = [
    ...state.recipeDraftIngredients,
    {
      rowId: getNextRecipeRowId(),
      productId: "",
      grams: 100
    }
  ];
  renderRecipeIngredientRows();
});

quickWaterButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    await request("/api/hydration", {
      method: "POST",
      body: JSON.stringify({
        amountMl: Number(button.dataset.water),
        loggedAt: nowTime(),
        date: state.selectedDate
      })
    });
    await loadDashboard();
    showFlash(`Добавлено ${button.dataset.water} мл воды`, "success");
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    state.currentMealType = button.dataset.mealFilter;
    await loadMeals();
  });
});

clearCheckedShoppingButton.addEventListener("click", async () => {
  await request("/api/shopping/checked", { method: "DELETE" });
  await Promise.all([loadShopping(), loadDashboard()]);
  showFlash("Закрытые позиции очищены", "success");
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveView(link.dataset.view, {
      closeDrawer: !isDesktopDrawer()
    });
  });
});

quickViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveView(button.dataset.viewTarget, {
      focusTarget: button.dataset.focusTarget || null
    });
  });
});

brandHomeButton?.addEventListener("click", () => {
  setActiveView("overview", {
    closeDrawer: !isDesktopDrawer()
  });
});

sidebarToggleButton?.addEventListener("click", () => {
  setDrawerOpen(!state.drawerOpen);
});

sidebarCloseButton?.addEventListener("click", () => {
  setDrawerOpen(false);
});

sidebarBackdrop?.addEventListener("click", () => {
  setDrawerOpen(false, { skipFocus: true });
});

window.addEventListener("resize", scheduleActiveSectionSync);
window.addEventListener("hashchange", () => {
  const hashView = parseViewFromHash() || (window.location.hash ? null : "overview");

  if (hashView) {
    setActiveView(hashView, {
      closeDrawer: false,
      scrollToTop: false,
      updateHash: false
    });
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.drawerOpen) {
    setDrawerOpen(false);
  }
});

previousDateButton.addEventListener("click", async () => {
  state.selectedDate = shiftDate(state.selectedDate, -1);
  state.weeklyPlanStart = state.selectedDate;
  await Promise.all([loadDashboard(), loadMeals(), loadWeeklyPlans()]);
});

nextDateButton.addEventListener("click", async () => {
  state.selectedDate = shiftDate(state.selectedDate, 1);
  state.weeklyPlanStart = state.selectedDate;
  await Promise.all([loadDashboard(), loadMeals(), loadWeeklyPlans()]);
});

todayButton.addEventListener("click", async () => {
  state.selectedDate = getTodayDate();
  state.weeklyPlanStart = state.selectedDate;
  await Promise.all([loadDashboard(), loadMeals(), loadWeeklyPlans()]);
});

datePickerInput.addEventListener("change", async () => {
  state.selectedDate = datePickerInput.value || getTodayDate();
  state.weeklyPlanStart = state.selectedDate;
  await Promise.all([loadDashboard(), loadMeals(), loadWeeklyPlans()]);
});

refreshButton.addEventListener("click", async () => {
  await refreshWorkspace();
  showFlash("Данные обновлены", "info");
});

setFieldValue(mealForm, "eatenAt", nowTime());
setFieldValue(plannerForm, "date", state.selectedDate);
setFieldValue(plannerForm, "plannedTime", "13:00");
setFieldValue(weeklyPlanForm, "startDate", state.weeklyPlanStart);
setFieldValue(shoppingForm, "unit", "шт");
registerViewPanels();
state.activeView = parseViewFromHash() || "overview";
setTheme(state.theme);
clearImportPreview();
syncLayoutMetrics();
syncDrawerMode();
setActiveView(state.activeView, {
  closeDrawer: false,
  scrollToTop: false,
  updateHash: false
});
resetRecipeDraft();

bootstrapSession().catch((error) => {
  setApiStatus("Ошибка подключения");
  showAuth(error.message);
});
