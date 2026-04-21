const tokenStorageKey = "nutriTrackToken";

const state = {
  token: localStorage.getItem(tokenStorageKey),
  user: null,
  dashboard: null,
  meals: [],
  products: [],
  currentMealType: "Все"
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
const goalsForm = document.querySelector("#goals-form");
const mealForm = document.querySelector("#meal-form");
const productForm = document.querySelector("#product-form");
const productAdminPanel = document.querySelector("#product-admin-panel");
const productsMeta = document.querySelector("#products-meta");
const productsList = document.querySelector("#products-list");
const summaryCards = document.querySelector("#summary-cards");
const mealsList = document.querySelector("#meals-list");
const mealCount = document.querySelector("#meal-count");
const summaryCardTemplate = document.querySelector("#summary-card-template");
const mealItemTemplate = document.querySelector("#meal-item-template");
const mealTypeBreakdown = document.querySelector("#meal-type-breakdown");
const weeklyTrend = document.querySelector("#weekly-trend");
const filterButtons = [...document.querySelectorAll("[data-meal-filter]")];

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

function setToken(token) {
  state.token = token;
  localStorage.setItem(tokenStorageKey, token);
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem(tokenStorageKey);
}

function showAuth(message = "После входа откроется рабочая панель пользователя.") {
  authShell.classList.remove("hidden");
  appShell.classList.add("hidden");
  sessionBadge.classList.add("hidden");
  logoutButton.classList.add("hidden");
  authMessage.textContent = message;
}

function showApp() {
  authShell.classList.add("hidden");
  appShell.classList.remove("hidden");
  sessionBadge.classList.remove("hidden");
  logoutButton.classList.remove("hidden");
}

async function request(path, options = {}, authRequired = true) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (authRequired && state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const payload = await response
    .json()
    .catch(() => ({ error: "Invalid server response" }));

  if (!response.ok) {
    if (response.status === 401 && authRequired) {
      clearSession();
      showAuth("Сессия завершена. Выполните вход снова.");
    }

    throw new Error(payload.error || "Request failed");
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

function formatDateTime(dateTimeString) {
  return new Date(dateTimeString).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getFocus(dashboard) {
  const { meals, goals, summary, insights } = dashboard;

  if (!meals.length) {
    return {
      title: "Начните дневник",
      text: "Добавьте первый приём пищи, чтобы система собрала аналитику."
    };
  }

  if (!insights.withinCalorieGoal) {
    return {
      title: "Есть превышение",
      text: `Фактическая калорийность выше цели на ${(summary.totals.calories - goals.calories).toFixed(0)} ккал.`
    };
  }

  if (summary.remaining.protein > 20) {
    return {
      title: "Нужно больше белка",
      text: `До цели по белку не хватает ${summary.remaining.protein.toFixed(1)} г.`
    };
  }

  return {
    title: "Рацион стабилен",
    text: `Средняя калорийность одного приёма пищи: ${insights.averageCalories.toFixed(0)} ккал.`
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
    insightAverageCalories.textContent =
      `${insights.averageCalories.toFixed(0)} ккал`;
    insightAverageProtein.textContent =
      `Средний белок: ${insights.averageProtein.toFixed(1)} г`;
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

function renderProducts(products) {
  productsList.innerHTML = "";
  productsMeta.textContent = `${products.length} продуктов в справочнике`;

  if (!products.length) {
    productsList.innerHTML =
      '<article class="product-card"><p class="muted-text">Каталог пока пуст.</p></article>';
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
        ${
          state.user?.role === "admin"
            ? '<button class="danger-button product-delete-button" type="button">Удалить</button>'
            : ""
        }
      </div>
      <p class="meal-macros">
        К: ${product.calories.toFixed(1)} · Б: ${product.protein.toFixed(1)} · Ж: ${product.fat.toFixed(1)} · У: ${product.carbs.toFixed(1)}
      </p>
    `;

    if (state.user?.role === "admin") {
      productCard
        .querySelector(".product-delete-button")
        .addEventListener("click", async () => {
          await request(`/api/products/${product.id}`, { method: "DELETE" });
          await loadProducts();
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
      '<article class="meal-card"><p class="muted-text">По выбранному фильтру записей нет. Попробуйте другой тип приёма пищи.</p></article>';
    return;
  }

  meals.forEach((meal) => {
    const item = mealItemTemplate.content.firstElementChild.cloneNode(true);
    item.querySelector(".meal-title").textContent = meal.title;
    item.querySelector(".meal-type").textContent = meal.mealType;
    item.querySelector(".meal-meta").textContent =
      `${meal.date} · ${meal.eatenAt} · ${meal.grams} г`;
    item.querySelector(".meal-macros").textContent =
      `Калории: ${meal.calories.toFixed(0)} · Белки: ${meal.protein.toFixed(1)} · Жиры: ${meal.fat.toFixed(1)} · Углеводы: ${meal.carbs.toFixed(1)}${meal.notes ? ` · ${meal.notes}` : ""}`;

    item.querySelector(".danger-button").addEventListener("click", async () => {
      await request(`/api/meals/${meal.id}`, { method: "DELETE" });
      await loadAppData();
      await loadMeals();
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
  heroUpdatedAt.textContent = `Данные активной сессии обновлены`;
  heroDateLabel.textContent = formatDate(dashboard.date);
  heroStorage.textContent = "Хранилище: SQLite-база данных.";
  heroUserName.textContent = dashboard.user.name;
  heroUserRole.textContent =
    dashboard.user.role === "admin"
      ? "Роль: администратор"
      : "Роль: пользователь";
  currentDateLabel.textContent = `Текущая дата: ${formatDate(dashboard.date)}`;
  sessionUserName.textContent = `${dashboard.user.name} · ${dashboard.user.role}`;
}

async function loadProducts() {
  state.products = await request("/api/products", {}, false);
  renderProducts(state.products);
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

async function loadAppData() {
  const [dashboard, goals] = await Promise.all([
    request("/api/dashboard"),
    request("/api/goals")
  ]);

  state.dashboard = dashboard;
  state.user = dashboard.user;
  setFormValues(goalsForm, goals);
  renderHero(dashboard);
  renderSummary(dashboard.summary, dashboard.goals);
  renderInsights(dashboard);
  renderWeeklyTrend(dashboard.weeklyTrend);
  productAdminPanel.classList.toggle("hidden", state.user.role !== "admin");
}

async function bootstrapSession() {
  apiStatus.textContent = "Система онлайн";

  if (!state.token) {
    showAuth();
    return;
  }

  try {
    await request("/api/auth/me");
    showApp();
    await Promise.all([loadAppData(), loadMeals(), loadProducts()]);
  } catch (error) {
    apiStatus.textContent = "Нужен вход";
    showAuth(error.message);
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
    await Promise.all([loadAppData(), loadMeals(), loadProducts()]);
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
    await Promise.all([loadAppData(), loadMeals(), loadProducts()]);
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

logoutButton.addEventListener("click", () => {
  clearSession();
  showAuth("Вы вышли из системы.");
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

  await loadAppData();
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
  mealForm.elements.namedItem("eatenAt").value = "08:00";

  await loadAppData();
  await loadMeals();
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
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    state.currentMealType = button.dataset.mealFilter;
    await loadMeals();
  });
});

refreshButton.addEventListener("click", async () => {
  await Promise.all([loadAppData(), loadMeals(), loadProducts()]);
});

mealForm.elements.namedItem("eatenAt").value = "08:00";

bootstrapSession().catch((error) => {
  apiStatus.textContent = "Ошибка подключения";
  showAuth(error.message);
});
