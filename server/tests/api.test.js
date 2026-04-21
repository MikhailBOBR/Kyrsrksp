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

test("exposes OpenAPI document", async () => {
  const response = await api("/api/openapi.json");

  assert.equal(response.status, 200);
  assert.equal(response.payload.openapi, "3.0.3");
  assert.ok(response.payload.paths["/api/dashboard"]);
});
