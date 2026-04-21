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

test("allows demo user to access dashboard and meals", async () => {
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
  assert.ok(Array.isArray(dashboard.payload.achievements));
  assert.ok(Array.isArray(dashboard.payload.recommendations));
  assert.ok(dashboard.payload.smartScore.total >= 0);
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

test("exposes OpenAPI document", async () => {
  const response = await api("/api/openapi.json");

  assert.equal(response.status, 200);
  assert.equal(response.payload.openapi, "3.0.3");
  assert.ok(response.payload.paths["/api/dashboard"]);
  assert.ok(response.payload.paths["/api/templates"]);
  assert.ok(response.payload.paths["/api/hydration"]);
});
