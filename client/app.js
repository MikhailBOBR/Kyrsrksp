const tokenStorageKey = "nutriTrackToken";
const themeStorageKey = "nutriTrackTheme";

const state = {
  token: localStorage.getItem(tokenStorageKey),
  theme: localStorage.getItem(themeStorageKey) || "light",
  user: null,
  dashboard: null,
  meals: [],
  products: [],
  templates: [],
  hydration: null,
  currentMealType: "Все",
  productSearch: ""
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

const goalsForm = document.querySelector("#goals-form");
const mealForm = document.querySelector("#meal-form");
const templateForm = document.querySelector("#template-form");
const productForm = document.querySelector("#product-form");
const productSearchForm = document.querySelector("#product-search-form");
const productSearchInput = document.querySelector("#product-search-input");

const productAdminPanel = document.querySelector("#product-admin-panel");
const productsMeta = document.querySelector("#products-meta");
const productsList = document.querySelector("#products-list");
const templatesList = document.querySelector("#templates-list");
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

const metricLabels = {
  calories: { title: "Калории", unit: "ккал" },
  protein: { title: "Белки", unit: "г" },
  fat: { title: "Жиры", unit: "г" },
  carbs: { title: "Углеводы", unit: "г" }
};

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
    if (input) {
      input.value = value;
    }
  });
}

function toNumber(form, key) {
  return Number(form.elements.namedItem(key).value);
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

function formatTime(value) {
  return value?.slice(0, 5) || "--:--";
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
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

function getFocus(dashboard) {
  const { meals, goals, summary, insights, hydration } = dashboard;

  if (!meals.length) {
    return {
      title: "Начните дневник",
      text: "Добавьте первый приём пищи и запись воды, чтобы открыть аналитику дня."
    };
  }

  if (hydration.progress < 60) {
    return {
      title: "Добавьте воды",
      text: `Сейчас закрыто только ${Math.round(hydration.progress)}% дневной гидратации.`
    };
  }

  if (!insights.withinCalorieGoal) {
    return {
      title: "Проверьте калорийность",
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
    text: `Smart Score сейчас на уровне ${dashboard.smartScore.total}.`
  };
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
      <p class="dashboard-label">${key}</p>
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
      <p class="dashboard-label">${item.mealType}</p>
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
      <strong>${item.title}</strong>
      <p class="dashboard-note">${item.description}</p>
    `;
    achievementsList.append(badge);
  });
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

function renderRecommendations(items) {
  recommendationsList.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "recommendation-card";
    const suggestions = item.suggestedProducts
      .map(
        (product) => `
          <button class="suggestion-chip" type="button" data-product-id="${product.id}">
            ${product.name}
          </button>
        `
      )
      .join("");

    card.innerHTML = `
      <p class="dashboard-label">${item.title}</p>
      <strong>${item.text}</strong>
      <div class="suggestion-row">${suggestions}</div>
    `;

    card.querySelectorAll("[data-product-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const product = item.suggestedProducts.find(
          (entry) => String(entry.id) === button.dataset.productId
        );

        if (product) {
          fillMealFormFromSource(
            {
              ...product,
              grams: 100,
              mealType: "Перекус",
              notes: `Добавлено по рекомендации: ${item.title}`
            },
            product.name
          );
          showFlash(`Продукт "${product.name}" перенесён в форму`, "success");
        }
      });
    });

    recommendationsList.append(card);
  });
}

function renderInsights(dashboard) {
  const { insights, summary, goals } = dashboard;

  if (!insights.topCalorieMeal) {
    insightTopCalorieTitle.textContent = "Нет записей";
    insightTopCalorieText.textContent = "Добавьте первый приём пищи.";
    insightTopProteinTitle.textContent = "Нет записей";
    insightTopProteinText.textContent = "Добавьте первый приём пищи.";
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
      <p class="dashboard-label">${new Date(`${item.date}T00:00:00`).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</p>
      <strong>${item.calories.toFixed(0)} ккал</strong>
      <p class="dashboard-note">Белки: ${item.protein.toFixed(1)} г</p>
      <div class="mini-progress">
        <div class="mini-progress-fill" style="width: ${(item.calories / maxCalories) * 100}%"></div>
      </div>
    `;
    weeklyTrend.append(bar);
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
      '<article class="stack-card"><p class="dashboard-note">Записей воды сегодня пока нет.</p></article>';
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
      await loadHydration();
      await loadDashboard();
      showFlash("Запись воды удалена", "success");
    });

    hydrationList.append(node);
  });
}

function renderTemplates(items) {
  templatesList.innerHTML = "";

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
          <strong>${template.name}</strong>
          <p class="dashboard-note">${template.mealType} · использований: ${template.usageCount}</p>
        </div>
        <div class="stack-card-actions">
          <button class="ghost-button small-button template-apply-button" type="button">Применить</button>
          <button class="danger-button small-button template-delete-button" type="button">Удалить</button>
        </div>
      </div>
      <p class="dashboard-note">
        ${template.calories.toFixed(0)} ккал · Б ${template.protein.toFixed(1)} · Ж ${template.fat.toFixed(1)} · У ${template.carbs.toFixed(1)}
      </p>
      <p class="dashboard-note">${template.notes || "Без описания"}</p>
    `;

    card.querySelector(".template-apply-button").addEventListener("click", async () => {
      await request(`/api/templates/${template.id}/apply`, {
        method: "POST",
        body: JSON.stringify({
          eatenAt: nowTime()
        })
      });
      await loadDashboard();
      await loadMeals();
      await loadTemplates();
      showFlash(`Шаблон "${template.name}" применён`, "success");
    });

    card.querySelector(".template-delete-button").addEventListener("click", async () => {
      await request(`/api/templates/${template.id}`, { method: "DELETE" });
      await loadTemplates();
      await loadDashboard();
      showFlash(`Шаблон "${template.name}" удалён`, "success");
    });

    templatesList.append(card);
  });
}

function renderProducts(products) {
  productsList.innerHTML = "";
  productsMeta.textContent = `${products.length} продуктов в справочнике`;

  if (!products.length) {
    productsList.innerHTML =
      '<article class="product-card"><p class="muted-text">Ничего не найдено по текущему запросу.</p></article>';
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("article");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <div class="product-head">
        <div>
          <h3 class="meal-title">${product.name}</h3>
          <p class="meal-meta">${product.brand || "Без бренда"} · ${product.category}</p>
        </div>
        <div class="stack-card-actions">
          <button class="ghost-button small-button product-fill-button" type="button">В форму</button>
          ${
            state.user?.role === "admin"
              ? '<button class="danger-button small-button product-delete-button" type="button">Удалить</button>'
              : ""
          }
        </div>
      </div>
      <p class="meal-macros">К: ${product.calories.toFixed(1)} · Б: ${product.protein.toFixed(1)} · Ж: ${product.fat.toFixed(1)} · У: ${product.carbs.toFixed(1)}</p>
    `;

    productCard
      .querySelector(".product-fill-button")
      .addEventListener("click", () => {
        fillMealFormFromSource(
          {
            ...product,
            grams: 100,
            mealType: "Перекус",
            notes: `Источник: ${product.name}`
          },
          product.name
        );
        showFlash(`Продукт "${product.name}" перенесён в форму`, "success");
      });

    if (state.user?.role === "admin") {
      productCard
        .querySelector(".product-delete-button")
        .addEventListener("click", async () => {
          await request(`/api/products/${product.id}`, { method: "DELETE" });
          await loadProducts();
          showFlash(`Продукт "${product.name}" удалён`, "success");
        });
    }

    productsList.append(productCard);
  });
}

function renderMeals(meals) {
  mealsList.innerHTML = "";
  const suffix =
    state.currentMealType === "Все"
      ? "за день"
      : `по фильтру "${state.currentMealType}"`;
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
      `${meal.date} · ${meal.eatenAt} · ${meal.grams} г`;
    item.querySelector(".meal-macros").textContent =
      `К: ${meal.calories.toFixed(0)} · Б: ${meal.protein.toFixed(1)} · Ж: ${meal.fat.toFixed(1)} · У: ${meal.carbs.toFixed(1)}${meal.notes ? ` · ${meal.notes}` : ""}`;

    const actions = item.querySelector(".meal-actions");
    actions.innerHTML = `
      <button class="ghost-button small-button save-template-button" type="button">В шаблон</button>
      <button class="danger-button small-button delete-meal-button" type="button">Удалить</button>
    `;

    actions
      .querySelector(".save-template-button")
      .addEventListener("click", async () => {
        await request(`/api/templates/from-meal/${meal.id}`, {
          method: "POST",
          body: JSON.stringify({
            name: `${meal.title} template`
          })
        });
        await loadTemplates();
        showFlash(`Запись "${meal.title}" сохранена в шаблоны`, "success");
      });

    actions.querySelector(".delete-meal-button").addEventListener("click", async () => {
      await request(`/api/meals/${meal.id}`, { method: "DELETE" });
      await loadDashboard();
      await loadMeals();
      showFlash(`Запись "${meal.title}" удалена`, "success");
    });

    mealsList.append(item);
  });
}

function renderFilters() {
  filterButtons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.mealFilter === state.currentMealType
    );
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
    : "Сегодня ещё нет записей";
  heroFocusTitle.textContent = focus.title;
  heroFocusText.textContent = focus.text;
  heroUpdatedAt.textContent = "Данные синхронизированы с сервером";
  heroDateLabel.textContent = formatDate(dashboard.date);
  heroStorage.textContent = "Хранилище: SQLite-база данных";
  heroUserName.textContent = dashboard.user.name;
  heroUserRole.textContent =
    dashboard.user.role === "admin" ? "Роль: администратор" : "Роль: пользователь";
  currentDateLabel.textContent = `Текущая дата: ${formatDate(dashboard.date)}`;
  sessionUserName.textContent = `${dashboard.user.name} · ${dashboard.user.role}`;
  heroSmartScore.textContent = dashboard.smartScore.total.toFixed(1);
  heroSmartScoreCaption.textContent = "Индекс качества текущего дня";
  heroStreak.textContent = `${dashboard.streak} дней`;
  heroStreakCaption.textContent = "Сколько дней подряд ведется дневник";
}

async function loadProducts() {
  const query = state.productSearch
    ? `?search=${encodeURIComponent(state.productSearch)}`
    : "";
  state.products = await request(`/api/products${query}`, {}, false);
  renderProducts(state.products);
}

async function loadTemplates() {
  state.templates = await request("/api/templates");
  renderTemplates(state.templates);
}

async function loadHydration() {
  state.hydration = await request("/api/hydration");
  renderHydration(state.hydration);
}

async function loadMeals() {
  const query =
    state.currentMealType === "Все"
      ? ""
      : `?mealType=${encodeURIComponent(state.currentMealType)}`;
  state.meals = await request(`/api/meals${query}`);
  renderMeals(state.meals);
  renderFilters();
}

async function loadDashboard() {
  state.dashboard = await request("/api/dashboard");
  state.user = state.dashboard.user;
  setFormValues(goalsForm, state.dashboard.goals);
  renderHero(state.dashboard);
  renderSummary(state.dashboard.summary, state.dashboard.goals);
  renderInsights(state.dashboard);
  renderWeeklyTrend(state.dashboard.weeklyTrend);
  renderAchievements(state.dashboard.achievements);
  renderRecommendations(state.dashboard.recommendations);
  renderScoreBreakdown(state.dashboard.smartScore);
  renderHydration(state.dashboard.hydration);
  heroWater.textContent = `${state.dashboard.hydration.totalMl.toFixed(0)} мл`;
  heroWaterCaption.textContent = `${Math.round(state.dashboard.hydration.progress)}% от цели`;
  productAdminPanel.classList.toggle("hidden", state.user.role !== "admin");
}

async function bootstrapSession() {
  setTheme(state.theme);
  apiStatus.textContent = "Система онлайн";

  if (!state.token) {
    showAuth();
    return;
  }

  try {
    await request("/api/auth/me");
    showApp();
    await Promise.all([loadDashboard(), loadMeals(), loadProducts(), loadTemplates()]);
  } catch (error) {
    apiStatus.textContent = "Нужен вход";
    showAuth(error.message);
  }
}

async function exportReport(format) {
  const response = await fetch(`/api/exports/daily-report?format=${format}`, {
    headers: {
      Authorization: `Bearer ${state.token}`
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Export failed");
  }

  const content = await response.text();
  const date = state.dashboard?.date || "today";

  if (format === "csv") {
    downloadTextFile(`nutrition-report-${date}.csv`, content, "text/csv;charset=utf-8");
  } else {
    downloadTextFile(
      `nutrition-report-${date}.json`,
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
    await Promise.all([loadDashboard(), loadMeals(), loadProducts(), loadTemplates()]);
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
    await Promise.all([loadDashboard(), loadMeals(), loadProducts(), loadTemplates()]);
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
    showFlash("JSON-отчёт выгружен", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
});

exportCsvButton.addEventListener("click", async () => {
  try {
    await exportReport("csv");
    showFlash("CSV-отчёт выгружен", "success");
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
  await loadDashboard();
  await loadMeals();
  showFlash("Приём пищи добавлен", "success");
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
  await loadTemplates();
  await loadDashboard();
  showFlash("Шаблон сохранён", "success");
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

productSearchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  state.productSearch = productSearchInput.value.trim();
  await loadProducts();
});

quickWaterButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    await request("/api/hydration", {
      method: "POST",
      body: JSON.stringify({
        amountMl: Number(button.dataset.water),
        loggedAt: nowTime()
      })
    });
    await loadHydration();
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

refreshButton.addEventListener("click", async () => {
  await Promise.all([loadDashboard(), loadMeals(), loadProducts(), loadTemplates()]);
  showFlash("Данные обновлены", "info");
});

mealForm.elements.namedItem("eatenAt").value = nowTime();
setTheme(state.theme);

bootstrapSession().catch((error) => {
  apiStatus.textContent = "Ошибка подключения";
  showAuth(error.message);
});
