const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

process.env.DB_PATH = path.resolve(__dirname, "../data/fuzz.db");
process.env.DB_PROVIDER = "sqlite";
process.env.DATABASE_URL = "";
process.env.JWT_SECRET = "fuzz-secret";

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

function mulberry32(seed) {
  let current = seed;

  return () => {
    current |= 0;
    current = (current + 0x6d2b79f5) | 0;
    let t = Math.imul(current ^ (current >>> 15), 1 | current);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20260422);

function pick(values) {
  return values[Math.floor(random() * values.length)];
}

function weirdScalar() {
  return pick([
    null,
    "",
    "ok",
    "very-long-string-".repeat(8),
    -100,
    -1,
    0,
    1,
    99999,
    true,
    false,
    [],
    {},
    "2026-13-99",
    "25:61"
  ]);
}

function weirdNumber() {
  return pick([null, "", -250, -1, 0, 1, 12.5, 100, 9999, true, false, "abc"]);
}

function buildRandomMealPayload() {
  return {
    title: weirdScalar(),
    mealType: pick(["Завтрак", "Обед", "Ужин", "Перекус", weirdScalar()]),
    eatenAt: pick(["08:00", "13:30", "20:10", weirdScalar()]),
    date: pick(["2026-04-22", weirdScalar()]),
    grams: weirdNumber(),
    calories: weirdNumber(),
    protein: weirdNumber(),
    fat: weirdNumber(),
    carbs: weirdNumber(),
    notes: weirdScalar()
  };
}

function buildRandomRecipePayload() {
  return {
    title: weirdScalar(),
    mealType: pick(["Завтрак", "Обед", "Ужин", "Перекус", weirdScalar()]),
    notes: weirdScalar(),
    instructions: weirdScalar(),
    ingredients: pick([
      [],
      [{ productId: 1, grams: 100 }],
      [{ productId: 1, grams: weirdNumber() }, { productId: 2, grams: weirdNumber() }],
      weirdScalar()
    ])
  };
}

function buildRandomGenerateWeekPayload() {
  return {
    startDate: pick(["2026-04-22", "2026-04-01", weirdScalar()]),
    days: pick([1, 5, 7, 14, 30, -5, weirdScalar()]),
    includeSnack: pick([true, false, weirdScalar()]),
    replaceExisting: pick([true, false, weirdScalar()])
  };
}

function buildRandomProductPayload() {
  return {
    name: weirdScalar(),
    brand: weirdScalar(),
    category: pick([
      "Белковые продукты",
      "Крупы и гарниры",
      "Овощи",
      "Фрукты",
      "Напитки",
      "Прочее",
      weirdScalar()
    ]),
    calories: weirdNumber(),
    protein: weirdNumber(),
    fat: weirdNumber(),
    carbs: weirdNumber()
  };
}

test("fuzzes auth registration with random invalid payloads without 500 errors", async () => {
  const allowedStatuses = new Set([201, 400]);

  for (let index = 0; index < 25; index += 1) {
    const response = await api("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: weirdScalar(),
        email: pick([`fuzz-${index}@example.com`, weirdScalar()]),
        password: weirdScalar()
      })
    });

    assert.ok(
      allowedStatuses.has(response.status),
      `Unexpected status ${response.status} on register fuzz iteration ${index}`
    );
  }
});

test("fuzzes protected business endpoints without server crashes", async () => {
  const userToken = await login("demo@nutritrack.local", "Demo123!");
  const adminToken = await login("admin@nutritrack.local", "Admin123!");
  const allowedStatuses = new Set([200, 201, 400, 401, 403, 404]);

  for (let index = 0; index < 30; index += 1) {
    const mealResponse = await api("/api/meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify(buildRandomMealPayload())
    });

    assert.ok(
      allowedStatuses.has(mealResponse.status),
      `Unexpected status ${mealResponse.status} on meal fuzz iteration ${index}`
    );

    const recipeResponse = await api("/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify(buildRandomRecipePayload())
    });

    assert.ok(
      allowedStatuses.has(recipeResponse.status),
      `Unexpected status ${recipeResponse.status} on recipe fuzz iteration ${index}`
    );

    const plannerResponse = await api("/api/planner/generate-week", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify(buildRandomGenerateWeekPayload())
    });

    assert.ok(
      allowedStatuses.has(plannerResponse.status),
      `Unexpected status ${plannerResponse.status} on planner fuzz iteration ${index}`
    );

    const productResponse = await api("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(buildRandomProductPayload())
    });

    assert.ok(
      allowedStatuses.has(productResponse.status),
      `Unexpected status ${productResponse.status} on product fuzz iteration ${index}`
    );
  }
});
