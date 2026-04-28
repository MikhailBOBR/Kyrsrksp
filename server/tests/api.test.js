const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

process.env.DB_PATH = path.resolve(__dirname, "../data/test.db");
process.env.DB_PROVIDER = "sqlite";
process.env.DATABASE_URL = "";
process.env.JWT_SECRET = "test-secret";

const dbFiles = [
  process.env.DB_PATH,
  `${process.env.DB_PATH}-wal`,
  `${process.env.DB_PATH}-shm`
];

dbFiles.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
});

const { initializeDatabase } = require("../src/db/init-schema");
const { createApp } = require("../src/app");
const { db } = require("../src/db/connection");
const { getLocalDate } = require("../src/lib/date");

let server;
let baseUrl;

test.before(async () => {
  await initializeDatabase();

  const app = createApp();

  server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await db.close();

  dbFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
});

async function api(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const payload = await response.json().catch(() => ({}));

  return {
    status: response.status,
    payload
  };
}

async function login(email, password) {
  const response = await api("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  assert.equal(response.status, 200);
  return response.payload.token;
}

test("registers a new user and returns token", async () => {
  const uniqueEmail = `tester-${Date.now()}@example.com`;

  const response = await api("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "Test User",
      email: uniqueEmail,
      password: "Password123!"
    })
  });

  assert.equal(response.status, 201);
  assert.equal(response.payload.user.email, uniqueEmail);
  assert.ok(response.payload.token);
});

test("denies dashboard access without auth token", async () => {
  const response = await api("/api/dashboard");
  assert.equal(response.status, 401);
});

test("allows demo user to access extended dashboard", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const dashboard = await api("/api/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(dashboard.status, 200);
  assert.equal(dashboard.payload.user.role, "user");
  assert.ok(Array.isArray(dashboard.payload.meals));
  assert.ok(Array.isArray(dashboard.payload.weeklyTrend));
  assert.ok(Array.isArray(dashboard.payload.extendedTrend));
  assert.ok(Array.isArray(dashboard.payload.achievements));
  assert.ok(Array.isArray(dashboard.payload.recommendations));
  assert.ok(dashboard.payload.smartScore.total >= 0);
  assert.ok(dashboard.payload.wellbeing);
  assert.ok(dashboard.payload.bodyMetrics);
  assert.ok(dashboard.payload.planner);
  assert.ok(dashboard.payload.shopping);
  assert.ok(dashboard.payload.comparison);
  assert.ok(dashboard.payload.dailyControls);
  assert.ok(dashboard.payload.dayNote);
  assert.ok(dashboard.payload.favorites);
  assert.equal(dashboard.payload.metadata.dbProvider, "sqlite");
});

test("returns goal presets and applies selected preset", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const presets = await api("/api/goals/presets", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(presets.status, 200);
  assert.ok(Array.isArray(presets.payload));
  assert.ok(presets.payload.some((preset) => preset.id === "high-protein"));

  const applied = await api("/api/goals/presets/high-protein/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({})
  });

  assert.equal(applied.status, 200);
  assert.equal(applied.payload.preset.id, "high-protein");
  assert.equal(applied.payload.goals.protein, 175);
});

test("prevents regular user from creating products", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const response = await api("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: "Новый продукт",
      category: "Прочее",
      calories: 100,
      protein: 10,
      fat: 3,
      carbs: 8
    })
  });

  assert.equal(response.status, 403);
});

test("allows admin to create product", async () => {
  const token = await login("admin@nutritrack.local", "Admin123!");

  const response = await api("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: "Тестовый продукт",
      brand: "QA",
      category: "Прочее",
      calories: 111,
      protein: 12,
      fat: 4,
      carbs: 9
    })
  });

  assert.equal(response.status, 201);
  assert.equal(response.payload.name, "Тестовый продукт");
});

test("prevents regular user from updating and deleting admin catalog entries", async () => {
  const adminToken = await login("admin@nutritrack.local", "Admin123!");
  const userToken = await login("demo@nutritrack.local", "Demo123!");

  const created = await api("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: "Role Model Product",
      brand: "QA",
      category: "РџСЂРѕС‡РµРµ",
      calories: 150,
      protein: 9,
      fat: 4,
      carbs: 18
    })
  });

  const products = await api("/api/products");

  assert.equal(products.status, 200);
  assert.ok(products.payload.length >= 1);

  const productId = products.payload[0].id;

  const updated = await api(`/api/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({
      name: "Illegal Update",
      brand: "QA",
      category: "РџСЂРѕС‡РµРµ",
      calories: 160,
      protein: 10,
      fat: 5,
      carbs: 17
    })
  });

  assert.equal(updated.status, 403);

  const deleted = await api(`/api/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${userToken}`
    }
  });

  assert.equal(deleted.status, 403);
});

test("creates meal for user and returns it in filtered list", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const created = await api("/api/meals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "Тестовый ужин",
      mealType: "Ужин",
      eatenAt: "20:30",
      grams: 250,
      calories: 510,
      protein: 34,
      fat: 18,
      carbs: 41,
      notes: "Создано тестом"
    })
  });

  assert.equal(created.status, 201);

  const meals = await api("/api/meals?mealType=Ужин", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(meals.status, 200);
  assert.ok(meals.payload.some((meal) => meal.title === "Тестовый ужин"));
});

test("tracks hydration and returns updated summary", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const created = await api("/api/hydration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      amountMl: 300,
      loggedAt: "19:00"
    })
  });

  assert.equal(created.status, 201);

  const hydration = await api("/api/hydration", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(hydration.status, 200);
  assert.ok(hydration.payload.totalMl >= 300);
  assert.ok(hydration.payload.entries.some((entry) => entry.id === created.payload.id));
});

test("creates and applies meal template", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const template = await api("/api/templates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: "Шаблон теста",
      mealType: "Завтрак",
      grams: 250,
      calories: 430,
      protein: 24,
      fat: 13,
      carbs: 49,
      notes: "Тестовый шаблон"
    })
  });

  assert.equal(template.status, 201);

  const applied = await api(`/api/templates/${template.payload.id}/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      eatenAt: "09:15"
    })
  });

  assert.equal(applied.status, 201);
  assert.equal(applied.payload.title, "Шаблон теста");
});

test("creates recipe, applies it and sends it to planner", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");
  const products = await api("/api/products");

  assert.equal(products.status, 200);
  assert.ok(products.payload.length >= 2);

  const recipe = await api("/api/recipes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "Recipe integration test",
      mealType: "Обед",
      notes: "Compound dish scenario validation",
      instructions: "Mix ingredients and save as recipe",
      ingredients: [
        { productId: products.payload[0].id, grams: 180 },
        { productId: products.payload[1].id, grams: 120 }
      ]
    })
  });

  assert.equal(recipe.status, 201);
  assert.equal(recipe.payload.title, "Recipe integration test");
  assert.equal(recipe.payload.ingredients.length, 2);

  const appliedMeal = await api(`/api/recipes/${recipe.payload.id}/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      date: getLocalDate(),
      eatenAt: "14:10"
    })
  });

  assert.equal(appliedMeal.status, 201);
  assert.equal(appliedMeal.payload.title, "Recipe integration test");

  const planned = await api(`/api/recipes/${recipe.payload.id}/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      date: getLocalDate(),
      plannedTime: "15:15"
    })
  });

  assert.equal(planned.status, 201);
  assert.equal(planned.payload.title, "Recipe integration test");
});

test("creates day note and returns it through dashboard", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");
  const today = getLocalDate();

  const saved = await api("/api/day-notes", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      date: today,
      title: "Тестовая заметка",
      focus: "Проверить новый блок заметок",
      wins: "API отвечает корректно",
      improvements: "Расширить покрытие тестами",
      notes: "Интеграционный тест"
    })
  });

  assert.equal(saved.status, 200);
  assert.equal(saved.payload.title, "Тестовая заметка");

  const dashboard = await api(`/api/dashboard?date=${today}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(dashboard.status, 200);
  assert.equal(dashboard.payload.dayNote.title, "Тестовая заметка");
  assert.ok(Array.isArray(dashboard.payload.recentDayNotes));
});

test("creates wellbeing checkin and returns readiness summary", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const updated = await api("/api/checkins", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      mood: 5,
      energy: 4,
      stress: 2,
      hunger: 3,
      sleepHours: 7.8,
      notes: "Тестовый wellbeing check-in"
    })
  });

  assert.equal(updated.status, 200);
  assert.equal(updated.payload.mood, 5);

  const summary = await api("/api/checkins", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(summary.status, 200);
  assert.ok(summary.payload.readinessScore > 0);
  assert.equal(summary.payload.entry.notes, "Тестовый wellbeing check-in");
});

test("creates body metric entry and exposes summary", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const created = await api("/api/metrics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      weightKg: 77.9,
      bodyFat: 18.2,
      waistCm: 81.5,
      notes: "Контрольный замер"
    })
  });

  assert.equal(created.status, 201);
  assert.equal(created.payload.weightKg, 77.9);

  const metrics = await api("/api/metrics", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(metrics.status, 200);
  assert.ok(metrics.payload.latest);
  assert.ok(Array.isArray(metrics.payload.entries));
  assert.ok(metrics.payload.entries.length >= 1);
});

test("creates meal plan from template and marks it completed", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const templates = await api("/api/templates", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const created = await api(`/api/planner/from-template/${templates.payload[0].id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      plannedTime: "18:40"
    })
  });

  assert.equal(created.status, 201);

  const completed = await api(`/api/planner/${created.payload.id}/completion`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      completed: true
    })
  });

  assert.equal(completed.status, 200);
  assert.equal(completed.payload.completed, true);

  const planner = await api(`/api/planner?date=${getLocalDate()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(planner.status, 200);
  assert.ok(Array.isArray(planner.payload.items));
});

test("generates weekly plan from templates and recipes", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");
  const startDate = getLocalDate();

  const generated = await api("/api/planner/generate-week", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      startDate,
      days: 5,
      includeSnack: true,
      replaceExisting: true
    })
  });

  assert.equal(generated.status, 201);
  assert.equal(generated.payload.days, 5);
  assert.equal(generated.payload.items.length, 20);

  const range = await api(
    `/api/planner?dateFrom=${encodeURIComponent(startDate)}&dateTo=${encodeURIComponent(
      generated.payload.endDate
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  assert.equal(range.status, 200);
  assert.ok(Array.isArray(range.payload));
  assert.equal(range.payload.length, 20);
});

test("adds product to shopping list and toggles checked state", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const products = await api("/api/products");
  assert.equal(products.status, 200);

  const created = await api(`/api/shopping/from-product/${products.payload[0].id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      quantity: 2,
      unit: "шт"
    })
  });

  assert.equal(created.status, 201);

  const toggled = await api(`/api/shopping/${created.payload.id}/check`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      checked: true
    })
  });

  assert.equal(toggled.status, 200);
  assert.equal(toggled.payload.checked, true);

  const shopping = await api("/api/shopping", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(shopping.status, 200);
  assert.ok(Array.isArray(shopping.payload.items));
  assert.ok(shopping.payload.summary.total >= 1);
});

test("adds favorites for product and template", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const products = await api("/api/products");
  const templates = await api("/api/templates", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const favoriteProduct = await api(`/api/favorites/products/${products.payload[0].id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({})
  });

  assert.equal(favoriteProduct.status, 201);

  const favoriteTemplate = await api(`/api/favorites/templates/${templates.payload[0].id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({})
  });

  assert.equal(favoriteTemplate.status, 201);

  const favorites = await api("/api/favorites", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(favorites.status, 200);
  assert.ok(Array.isArray(favorites.payload.products));
  assert.ok(Array.isArray(favorites.payload.templates));
  assert.ok(favorites.payload.products.length >= 1);
  assert.ok(favorites.payload.templates.length >= 1);
});

test("rejects removed csv daily report export", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const response = await api("/api/exports/daily-report?format=csv", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(response.status, 400);
  assert.equal(response.payload.error, "Export format is not supported");
});

test("exposes extended OpenAPI document", async () => {
  const response = await api("/api/openapi.json");

  assert.equal(response.status, 200);
  assert.equal(response.payload.openapi, "3.0.3");
  assert.ok(response.payload.paths["/api/dashboard"]);
  assert.ok(response.payload.paths["/api/templates"]);
  assert.ok(response.payload.paths["/api/hydration"]);
  assert.ok(response.payload.paths["/api/checkins"]);
  assert.ok(response.payload.paths["/api/metrics"]);
  assert.ok(response.payload.paths["/api/planner"]);
  assert.ok(response.payload.paths["/api/shopping"]);
  assert.ok(response.payload.paths["/api/goals/presets"]);
  assert.ok(response.payload.paths["/api/day-notes"]);
  assert.ok(response.payload.paths["/api/favorites"]);
  assert.ok(response.payload.paths["/api/recipes"]);
  assert.ok(response.payload.paths["/api/recipes/{id}/apply"]);
  assert.ok(response.payload.paths["/api/planner/generate-week"]);
  assert.ok(response.payload.paths["/api/imports/preview"]);
  assert.ok(response.payload.paths["/api/imports/apply"]);
  assert.ok(response.payload.paths["/api/imports/template"]);
});
