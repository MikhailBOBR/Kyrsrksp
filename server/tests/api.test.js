const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

process.env.DB_PATH = path.resolve(__dirname, "../data/test.db");
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
  initializeDatabase();

  const app = createApp();

  server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();

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

test("exports daily report in csv format", async () => {
  const token = await login("demo@nutritrack.local", "Demo123!");

  const response = await fetch(`${baseUrl}/api/exports/daily-report?format=csv`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const content = await response.text();

  assert.equal(response.status, 200);
  assert.match(content, /goal_calories/);
  assert.match(content, /meal_id/);
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
});
