/* node:coverage ignore next 10000 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

process.env.DB_PATH = path.resolve(__dirname, "../data/fuzz.db");
process.env.DB_PROVIDER = "sqlite";
process.env.DATABASE_URL = "";
process.env.JWT_SECRET = "fuzz-secret";
process.env.APP_ENV = "test";
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "error";

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

function buildRandomHydrationPayload() {
  return {
    amountMl: weirdNumber(),
    loggedAt: pick(["07:10", "12:20", "22:40", weirdScalar()]),
    date: pick(["2026-04-22", weirdScalar()])
  };
}

function buildRandomCheckinPayload() {
  return {
    mood: weirdNumber(),
    energy: weirdNumber(),
    stress: weirdNumber(),
    hunger: weirdNumber(),
    sleepHours: weirdNumber(),
    date: pick(["2026-04-22", weirdScalar()]),
    notes: weirdScalar()
  };
}

function buildRandomMetricPayload() {
  return {
    weightKg: weirdNumber(),
    bodyFat: weirdNumber(),
    waistCm: weirdNumber(),
    chestCm: weirdNumber(),
    date: pick(["2026-04-22", weirdScalar()]),
    notes: weirdScalar()
  };
}

function buildRandomShoppingPayload() {
  return {
    title: weirdScalar(),
    category: weirdScalar(),
    quantity: weirdNumber(),
    unit: pick(["шт", "уп", "кг", "г", "л", "мл", weirdScalar()]),
    plannedFor: pick(["2026-04-22", weirdScalar()]),
    source: weirdScalar(),
    notes: weirdScalar()
  };
}

function buildRandomDayNotePayload() {
  return {
    date: pick(["2026-04-22", weirdScalar()]),
    title: weirdScalar(),
    focus: weirdScalar(),
    wins: weirdScalar(),
    improvements: weirdScalar(),
    notes: weirdScalar()
  };
}

function buildRandomImportPayload() {
  return {
    dataset: pick(["meals", "templates", "hydration", "products", weirdScalar()]),
    format: pick(["json", "tsv", weirdScalar()]),
    content: pick([
      "[]",
      "[{}]",
      "title\tmealType\teatenAt\tgrams\tcalories\tprotein\tfat\tcarbs\nBad\tОбед\t12:00\t100\t200\t20\t5\t25",
      weirdScalar()
    ])
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

test("fuzzes malformed json bodies across mutating endpoints without 500 errors", async () => {
  const userToken = await login("demo@nutritrack.local", "Demo123!");
  const adminToken = await login("admin@nutritrack.local", "Admin123!");
  const allowedStatuses = new Set([400, 401, 403, 404]);
  const endpoints = [
    { method: "PUT", pathname: "/api/goals", token: userToken },
    { method: "POST", pathname: "/api/meals", token: userToken },
    { method: "POST", pathname: "/api/templates", token: userToken },
    { method: "POST", pathname: "/api/recipes", token: userToken },
    { method: "POST", pathname: "/api/planner", token: userToken },
    { method: "POST", pathname: "/api/hydration", token: userToken },
    { method: "PUT", pathname: "/api/checkins", token: userToken },
    { method: "POST", pathname: "/api/metrics", token: userToken },
    { method: "PUT", pathname: "/api/day-notes", token: userToken },
    { method: "POST", pathname: "/api/shopping", token: userToken },
    { method: "POST", pathname: "/api/imports/preview", token: userToken },
    { method: "POST", pathname: "/api/imports/apply", token: userToken },
    { method: "POST", pathname: "/api/products", token: adminToken }
  ];

  for (const endpoint of endpoints) {
    const response = await api(endpoint.pathname, {
      method: endpoint.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${endpoint.token}`
      },
      body: "{\"broken\":"
    });

    assert.ok(
      allowedStatuses.has(response.status),
      `Unexpected status ${response.status} for malformed JSON ${endpoint.method} ${endpoint.pathname}`
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

test("fuzzes daily, import and shopping endpoints without server crashes", async () => {
  const userToken = await login("demo@nutritrack.local", "Demo123!");
  const adminToken = await login("admin@nutritrack.local", "Admin123!");
  const allowedStatuses = new Set([200, 201, 400, 401, 403, 404]);

  for (let index = 0; index < 20; index += 1) {
    const queryDate = encodeURIComponent(String(pick(["2026-04-22", weirdScalar()])));
    const queryRoutes = [
      `/api/dashboard?date=${queryDate}`,
      `/api/hydration?date=${queryDate}`,
      `/api/checkins?date=${queryDate}`,
      `/api/planner?date=${queryDate}`,
      `/api/day-notes?date=${queryDate}`,
      `/api/day-notes/recent?limit=${encodeURIComponent(String(weirdNumber()))}`,
      `/api/products?search=${encodeURIComponent(String(weirdScalar()))}&category=${encodeURIComponent(String(weirdScalar()))}`
    ];

    for (const pathname of queryRoutes) {
      const response = await api(pathname, {
        headers: pathname.startsWith("/api/products")
          ? {}
          : {
              Authorization: `Bearer ${userToken}`
            }
      });

      assert.ok(
        allowedStatuses.has(response.status),
        `Unexpected status ${response.status} on query fuzz route ${pathname}`
      );
    }

    const mutationCases = [
      { pathname: "/api/hydration", method: "POST", token: userToken, body: buildRandomHydrationPayload() },
      { pathname: "/api/checkins", method: "PUT", token: userToken, body: buildRandomCheckinPayload() },
      { pathname: "/api/metrics", method: "POST", token: userToken, body: buildRandomMetricPayload() },
      { pathname: "/api/day-notes", method: "PUT", token: userToken, body: buildRandomDayNotePayload() },
      { pathname: "/api/shopping", method: "POST", token: userToken, body: buildRandomShoppingPayload() },
      { pathname: "/api/imports/preview", method: "POST", token: userToken, body: buildRandomImportPayload() },
      { pathname: "/api/imports/apply", method: "POST", token: userToken, body: buildRandomImportPayload() },
      { pathname: "/api/products", method: "POST", token: adminToken, body: buildRandomProductPayload() }
    ];

    for (const item of mutationCases) {
      const response = await api(item.pathname, {
        method: item.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${item.token}`
        },
        body: JSON.stringify(item.body)
      });

      assert.ok(
        allowedStatuses.has(response.status),
        `Unexpected status ${response.status} on mutation fuzz route ${item.method} ${item.pathname}`
      );
    }
  }
});
