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

const state = {
  token: localStorage.getItem(tokenStorageKey),
  theme: localStorage.getItem(themeStorageKey) || "light",
  selectedDate: getTodayDate(),
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
const refreshButton = document.querySelector("#refresh-button");
const themeToggle = document.querySelector("#theme-toggle");
const exportJsonButton = document.querySelector("#export-json-button");
const exportCsvButton = document.querySelector("#export-csv-button");
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

function showAuth(message = "После входа откроется рабочая панель пользователя.") {
  authShell.classList.remove("hidden");
  appShell.classList.add("hidden");
  sessionBadge.classList.add("hidden");
  logoutButton.classList.add("hidden");
  exportJsonButton.classList.add("hidden");
  exportCsvButton.classList.add("hidden");
  authMessage.textContent = message;
}

function showApp() {
  authShell.classList.add("hidden");
  appShell.classList.remove("hidden");
  sessionBadge.classList.remove("hidden");
  logoutButton.classList.remove("hidden");
  exportJsonButton.classList.remove("hidden");
  exportCsvButton.classList.remove("hidden");
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

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    const input = form.elements.namedItem(key);

    if (input && value !== undefined && value !== null) {
      input.value = value;
    }
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

function syncDateControls() {
  datePickerInput.value = state.selectedDate;
  plannerForm.elements.namedItem("date").value = state.selectedDate;
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
  mealForm.elements.namedItem("title").value = titleOverride || source.name || source.title;
  mealForm.elements.namedItem("mealType").value = source.mealType || "Перекус";
  mealForm.elements.namedItem("grams").value = source.grams || 100;
  mealForm.elements.namedItem("calories").value = source.calories;
  mealForm.elements.namedItem("protein").value = source.protein;
  mealForm.elements.namedItem("fat").value = source.fat;
  mealForm.elements.namedItem("carbs").value = source.carbs;
  mealForm.elements.namedItem("notes").value = source.notes || "";
  mealForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fillPlannerFormFromSource(source, titleOverride) {
  plannerForm.elements.namedItem("title").value = titleOverride || source.name || source.title;
  plannerForm.elements.namedItem("mealType").value = source.mealType || "Обед";
  plannerForm.elements.namedItem("date").value = state.selectedDate;
  plannerForm.elements.namedItem("plannedTime").value = source.eatenAt || "13:00";
  plannerForm.elements.namedItem("targetCalories").value = source.calories || 0;
  plannerForm.elements.namedItem("targetProtein").value = source.protein || 0;
  plannerForm.elements.namedItem("targetFat").value = source.fat || 0;
  plannerForm.elements.namedItem("targetCarbs").value = source.carbs || 0;
  plannerForm.scrollIntoView({ behavior: "smooth", block: "start" });
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
  await loadShopping();
  await loadDashboard();
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
      await loadDashboard();
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
      await Promise.all([loadDashboard(), loadWeeklyPlans()]);
      showFlash(`Рецепт "${recipe.title}" добавлен в план`, "success");
    });

    node.querySelector(".recipe-delete-button").addEventListener("click", async () => {
      await request(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      await loadRecipes();
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
        await loadProducts();
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
      await loadTemplates();
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
  heroStorage.textContent = "Хранилище: SQLite-база данных";
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
      await loadDashboard();
      showFlash("Статус плана обновлен", "success");
    });

    node.querySelector(".planner-delete-button").addEventListener("click", async () => {
      await request(`/api/planner/${item.id}`, { method: "DELETE" });
      await loadDashboard();
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
        await loadDashboard();
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
  await Promise.all([
    loadDashboard(),
    loadGoalPresets(),
    loadMeals(),
    loadProducts(),
    loadRecipes(),
    loadTemplates(),
    loadMetrics(),
    loadShopping(),
    loadWeeklyPlans()
  ]);
}

async function bootstrapSession() {
  setTheme(state.theme);
  apiStatus.textContent = "Система онлайн";
  syncDateControls();
  mealForm.elements.namedItem("eatenAt").value = nowTime();
  weeklyPlanForm.elements.namedItem("startDate").value = state.weeklyPlanStart;

  if (!state.token) {
    showAuth();
    return;
  }

  try {
    await request("/api/auth/me");
    showApp();
    await refreshWorkspace();
  } catch (error) {
    apiStatus.textContent = "Нужен вход";
    showAuth(error.message);
  }
}

async function exportReport(format) {
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

  if (format === "csv") {
    downloadTextFile(`nutrition-report-${state.selectedDate}.csv`, content, "text/csv;charset=utf-8");
  } else {
    downloadTextFile(
      `nutrition-report-${state.selectedDate}.json`,
      content,
      "application/json;charset=utf-8"
    );
  }
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
    await refreshWorkspace();
    showFlash("Вход выполнен", "success");
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
    await refreshWorkspace();
    showFlash("Аккаунт создан", "success");
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
  await loadDashboard();
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

mealForm.elements.namedItem("eatenAt").value = nowTime();
plannerForm.elements.namedItem("date").value = state.selectedDate;
plannerForm.elements.namedItem("plannedTime").value = "13:00";
weeklyPlanForm.elements.namedItem("startDate").value = state.weeklyPlanStart;
shoppingForm.elements.namedItem("unit").value = "шт";
setTheme(state.theme);
resetRecipeDraft();

bootstrapSession().catch((error) => {
  apiStatus.textContent = "Ошибка подключения";
  showAuth(error.message);
});
