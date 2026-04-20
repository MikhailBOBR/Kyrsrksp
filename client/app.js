const state = {
  goals: null,
  meals: [],
  summary: null
};

const goalsForm = document.querySelector("#goals-form");
const mealForm = document.querySelector("#meal-form");
const summaryCards = document.querySelector("#summary-cards");
const mealsList = document.querySelector("#meals-list");
const mealCount = document.querySelector("#meal-count");
const apiStatus = document.querySelector("#api-status");
const refreshButton = document.querySelector("#refresh-button");
const summaryCardTemplate = document.querySelector("#summary-card-template");
const mealItemTemplate = document.querySelector("#meal-item-template");
const heroCalories = document.querySelector("#hero-calories");
const heroCaloriesCaption = document.querySelector("#hero-calories-caption");
const heroCaloriesBar = document.querySelector("#hero-calories-bar");
const heroMealsCount = document.querySelector("#hero-meals-count");
const heroLastMeal = document.querySelector("#hero-last-meal");
const heroFocusTitle = document.querySelector("#hero-focus-title");
const heroFocusText = document.querySelector("#hero-focus-text");

const metricLabels = {
  calories: { title: "Калории", unit: "ккал" },
  protein: { title: "Белки", unit: "г" },
  fat: { title: "Жиры", unit: "г" },
  carbs: { title: "Углеводы", unit: "г" }
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Request failed");
  }

  return response.json();
}

function setFormValues(form, values) {
  for (const [key, value] of Object.entries(values)) {
    const input = form.elements.namedItem(key);
    if (input) {
      input.value = value;
    }
  }
}

function toNumber(form, key) {
  return Number(form.elements.namedItem(key).value);
}

function formatMetricValue(metric, value) {
  return metric === "calories" ? value.toFixed(0) : value.toFixed(1);
}

function getFocus(summary, meals) {
  if (!meals.length) {
    return {
      title: "Начните дневник",
      text: "Добавьте первый приём пищи, чтобы увидеть аналитику за день."
    };
  }

  if (summary.progress.calories > 100) {
    return {
      title: "Проверьте калорийность",
      text: "Текущий объём калорий уже превышает дневную цель."
    };
  }

  if (summary.remaining.protein > 25) {
    return {
      title: "Доберите белок",
      text: `До целевого значения не хватает ${summary.remaining.protein.toFixed(1)} г белка.`
    };
  }

  if (summary.remaining.calories <= 250) {
    return {
      title: "Финиш дня близко",
      text: `До лимита осталось ${summary.remaining.calories.toFixed(0)} ккал.`
    };
  }

  return {
    title: "Рацион под контролем",
    text: `Заполнено ${Math.round(summary.progress.calories)}% дневной калорийности.`
  };
}

function renderSummary(summary) {
  summaryCards.innerHTML = "";

  for (const [key, config] of Object.entries(metricLabels)) {
    const card = summaryCardTemplate.content.firstElementChild.cloneNode(true);
    const total = summary.totals[key];
    const goal = summary.goals[key];
    const remaining = summary.remaining[key];
    const progress = Math.min(summary.progress[key], 100);

    card.querySelector(".metric-name").textContent = config.title;
    card.querySelector(".metric-total").textContent =
      `${formatMetricValue(key, total)} ${config.unit}`;
    card.querySelector(".metric-details").textContent =
      `Цель: ${formatMetricValue(key, goal)} ${config.unit} · Осталось: ${formatMetricValue(key, remaining)} ${config.unit}`;
    card.querySelector(".progress-fill").style.width = `${progress}%`;

    summaryCards.append(card);
  }
}

function renderMeals(meals) {
  mealsList.innerHTML = "";
  mealCount.textContent = `${meals.length} записей`;

  if (!meals.length) {
    mealsList.innerHTML =
      '<article class="meal-card"><p class="muted-text">Сегодня пока нет записей. Добавьте первый приём пищи, чтобы заполнить журнал.</p></article>';
    return;
  }

  meals.forEach((meal) => {
    const item = mealItemTemplate.content.firstElementChild.cloneNode(true);
    item.querySelector(".meal-title").textContent = meal.title;
    item.querySelector(".meal-type").textContent = meal.mealType;
    item.querySelector(".meal-meta").textContent =
      `${meal.eatenAt} · ${meal.grams} г · ${meal.calories} ккал`;
    item.querySelector(".meal-macros").textContent =
      `Белки: ${meal.protein.toFixed(1)} г · Жиры: ${meal.fat.toFixed(1)} г · Углеводы: ${meal.carbs.toFixed(1)} г`;

    item.querySelector(".danger-button").addEventListener("click", async () => {
      await request(`/api/meals/${meal.id}`, { method: "DELETE" });
      await loadDashboard();
    });

    mealsList.append(item);
  });
}

function renderHero(health, meals, summary) {
  const latestMeal = meals[meals.length - 1];
  const focus = getFocus(summary, meals);

  apiStatus.textContent =
    health.status === "ok" ? "Система онлайн" : "Система недоступна";
  heroCalories.textContent = `${summary.totals.calories.toFixed(0)} ккал`;
  heroCaloriesCaption.textContent =
    `${Math.round(summary.progress.calories)}% дневной цели · осталось ${summary.remaining.calories.toFixed(0)} ккал`;
  heroCaloriesBar.style.width = `${Math.min(summary.progress.calories, 100)}%`;
  heroMealsCount.textContent = String(meals.length);
  heroLastMeal.textContent = latestMeal
    ? `${latestMeal.mealType}: ${latestMeal.title} в ${latestMeal.eatenAt}`
    : "Сегодня ещё нет записей";
  heroFocusTitle.textContent = focus.title;
  heroFocusText.textContent = focus.text;
}

async function loadDashboard() {
  const [health, goals, meals, summary] = await Promise.all([
    request("/api/health"),
    request("/api/goals"),
    request("/api/meals"),
    request("/api/summary")
  ]);

  state.goals = goals;
  state.meals = meals.items;
  state.summary = summary;

  setFormValues(goalsForm, goals);
  renderHero(health, meals.items, summary);
  renderSummary(summary);
  renderMeals(meals.items);
}

goalsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    calories: toNumber(goalsForm, "calories"),
    protein: toNumber(goalsForm, "protein"),
    fat: toNumber(goalsForm, "fat"),
    carbs: toNumber(goalsForm, "carbs")
  };

  await request("/api/goals", {
    method: "PUT",
    body: JSON.stringify(payload)
  });

  await loadDashboard();
});

mealForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    title: mealForm.elements.namedItem("title").value.trim(),
    mealType: mealForm.elements.namedItem("mealType").value,
    eatenAt: mealForm.elements.namedItem("eatenAt").value,
    grams: toNumber(mealForm, "grams"),
    calories: toNumber(mealForm, "calories"),
    protein: toNumber(mealForm, "protein"),
    fat: toNumber(mealForm, "fat"),
    carbs: toNumber(mealForm, "carbs")
  };

  await request("/api/meals", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  mealForm.reset();
  mealForm.elements.namedItem("mealType").value = "Завтрак";
  mealForm.elements.namedItem("eatenAt").value = "08:00";
  await loadDashboard();
});

refreshButton.addEventListener("click", loadDashboard);

mealForm.elements.namedItem("eatenAt").value = "08:00";

loadDashboard().catch((error) => {
  apiStatus.textContent = "Ошибка подключения";
  mealsList.innerHTML =
    `<article class="meal-card"><p class="muted-text">${error.message}</p></article>`;
});
