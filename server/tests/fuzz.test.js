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

function encodeFuzzValue(value) {
  return encodeURIComponent(String(value));
}

function applyId(pathname, id) {
  return pathname.replace(":id", id);
}

function buildFuzzHeaders(item) {
  const headers = { ...(item.headers || {}) };
  const hasBody = Object.prototype.hasOwnProperty.call(item, "body");
  const hasRawBody = Object.prototype.hasOwnProperty.call(item, "rawBody");

  if ((hasBody || hasRawBody) && item.contentType !== null) {
    headers["Content-Type"] = item.contentType || "application/json";
  }

  if (item.token) {
    headers.Authorization = `Bearer ${item.token}`;
  }

  return headers;
}

function buildFuzzBody(item) {
  if (Object.prototype.hasOwnProperty.call(item, "rawBody")) {
    return item.rawBody;
  }

  if (Object.prototype.hasOwnProperty.call(item, "body")) {
    return JSON.stringify(item.body);
  }

  return undefined;
}

async function sendFuzzCase(item) {
  const method = item.method || "GET";
  const body = buildFuzzBody(item);
  const options = {
    method,
    headers: buildFuzzHeaders(item)
  };

  if (body !== undefined && method !== "GET" && method !== "HEAD") {
    options.body = body;
  }

  return api(item.pathname, options);
}

function buildAdversarialApiCases({ userToken, adminToken }) {
  const cases = [];
  const invalidToken = "invalid.jwt.token";
  const queryValues = [
    "",
    " ",
    "2026-02-30",
    "2026-13-99",
    "25:61",
    "-1",
    "0",
    "1.5",
    "NaN",
    "Infinity",
    "null",
    "undefined",
    "[]",
    "{}",
    "very-long-query-".repeat(18),
    "../admin",
    "%00",
    "x&role=admin",
    "DROP TABLE meals",
    "999999999999"
  ];
  const queryRoutes = [
    {
      label: "dashboard date",
      token: userToken,
      pathname: (value) => `/api/dashboard?date=${encodeFuzzValue(value)}`
    },
    {
      label: "hydration date",
      token: userToken,
      pathname: (value) => `/api/hydration?date=${encodeFuzzValue(value)}`
    },
    {
      label: "meals filters",
      token: userToken,
      pathname: (value) =>
        `/api/meals?date=${encodeFuzzValue(value)}&mealType=${encodeFuzzValue(value)}`
    },
    {
      label: "planner date",
      token: userToken,
      pathname: (value) => `/api/planner?date=${encodeFuzzValue(value)}`
    },
    {
      label: "day notes date",
      token: userToken,
      pathname: (value) => `/api/day-notes?date=${encodeFuzzValue(value)}`
    },
    {
      label: "recent day notes limit",
      token: userToken,
      pathname: (value) => `/api/day-notes/recent?limit=${encodeFuzzValue(value)}`
    },
    {
      label: "products filters",
      pathname: (value) =>
        `/api/products?search=${encodeFuzzValue(value)}&category=${encodeFuzzValue(value)}`
    },
    {
      label: "daily report query",
      token: userToken,
      pathname: (value) =>
        `/api/exports/daily-report?date=${encodeFuzzValue(value)}&format=${encodeFuzzValue(value)}`
    },
    {
      label: "import template query",
      token: userToken,
      pathname: (value) =>
        `/api/imports/template?dataset=${encodeFuzzValue(value)}&format=${encodeFuzzValue(value)}`
    },
    {
      label: "admin users query",
      token: adminToken,
      pathname: (value) => `/api/users?search=${encodeFuzzValue(value)}`
    }
  ];

  queryValues.forEach((value, index) => {
    const route = queryRoutes[index % queryRoutes.length];
    cases.push({
      name: `query ${route.label} ${index + 1}`,
      pathname: route.pathname(value),
      token: route.token
    });
  });

  cases.push(
    { name: "auth me without token", pathname: "/api/auth/me" },
    { name: "auth me invalid token", pathname: "/api/auth/me", token: invalidToken },
    { name: "login empty object", method: "POST", pathname: "/api/auth/login", body: {} },
    { name: "login null body", method: "POST", pathname: "/api/auth/login", body: null },
    { name: "login array body", method: "POST", pathname: "/api/auth/login", body: [] },
    { name: "login long fields", method: "POST", pathname: "/api/auth/login", body: { email: "x".repeat(512), password: "y".repeat(512) } },
    { name: "register primitive body", method: "POST", pathname: "/api/auth/register", body: "text" },
    { name: "register duplicate-like body", method: "POST", pathname: "/api/auth/register", body: { name: "", email: "demo@nutritrack.local", password: "" } },
    { name: "admin route user token", pathname: "/api/users", token: userToken },
    { name: "admin role invalid token", method: "PATCH", pathname: "/api/users/1/role", token: invalidToken, body: { role: "admin" } }
  );

  const bodyShapes = [
    { label: "empty object", body: {} },
    { label: "null", body: null },
    { label: "array", body: [{}] },
    { label: "string", body: "plain-string" },
    { label: "number", body: 42 },
    { label: "boolean", body: true },
    {
      label: "oversized fields",
      body: {
        title: "oversized-".repeat(512),
        notes: "nested-notes-".repeat(512),
        calories: "NaN"
      }
    },
    {
      label: "nested object",
      body: {
        title: { nested: true },
        date: { year: 2026 },
        quantity: { value: 1 },
        ingredients: [{ productId: {}, grams: [] }]
      }
    }
  ];
  const mutationRoutes = [
    { method: "PUT", pathname: "/api/goals", token: userToken },
    { method: "POST", pathname: "/api/meals", token: userToken },
    { method: "POST", pathname: "/api/templates", token: userToken },
    { method: "POST", pathname: "/api/recipes", token: userToken },
    { method: "POST", pathname: "/api/planner", token: userToken },
    { method: "POST", pathname: "/api/planner/generate-week", token: userToken },
    { method: "POST", pathname: "/api/hydration", token: userToken },
    { method: "PUT", pathname: "/api/checkins", token: userToken },
    { method: "POST", pathname: "/api/metrics", token: userToken },
    { method: "PUT", pathname: "/api/day-notes", token: userToken },
    { method: "POST", pathname: "/api/shopping", token: userToken },
    { method: "POST", pathname: "/api/imports/preview", token: userToken },
    { method: "POST", pathname: "/api/imports/apply", token: userToken },
    { method: "POST", pathname: "/api/products", token: adminToken },
    { method: "PATCH", pathname: "/api/users/1/role", token: adminToken }
  ];

  for (let index = 0; index < 30; index += 1) {
    const route = mutationRoutes[index % mutationRoutes.length];
    const shape = bodyShapes[index % bodyShapes.length];

    cases.push({
      name: `body shape ${shape.label} ${route.method} ${route.pathname}`,
      ...route,
      body: shape.body
    });
  }

  const idValues = [
    "0",
    "-1",
    "abc",
    "1.5",
    "999999",
    "NaN",
    "Infinity",
    "..%2F1",
    "%20",
    "00000000000000000001"
  ];
  const idRoutes = [
    { method: "PUT", pathname: "/api/meals/:id", token: userToken, body: buildRandomMealPayload() },
    { method: "DELETE", pathname: "/api/meals/:id", token: userToken },
    { method: "POST", pathname: "/api/templates/from-meal/:id", token: userToken, body: {} },
    { method: "POST", pathname: "/api/templates/:id/apply", token: userToken, body: {} },
    { method: "DELETE", pathname: "/api/templates/:id", token: userToken },
    { method: "POST", pathname: "/api/recipes/:id/apply", token: userToken, body: {} },
    { method: "POST", pathname: "/api/recipes/:id/plan", token: userToken, body: {} },
    { method: "DELETE", pathname: "/api/recipes/:id", token: userToken },
    { method: "POST", pathname: "/api/planner/from-template/:id", token: userToken, body: {} },
    { method: "PATCH", pathname: "/api/planner/:id/completion", token: userToken, body: { completed: weirdScalar() } },
    { method: "DELETE", pathname: "/api/planner/:id", token: userToken },
    { method: "DELETE", pathname: "/api/hydration/:id", token: userToken },
    { method: "DELETE", pathname: "/api/metrics/:id", token: userToken },
    { method: "POST", pathname: "/api/shopping/from-product/:id", token: userToken, body: {} },
    { method: "PATCH", pathname: "/api/shopping/:id/check", token: userToken, body: { checked: weirdScalar() } },
    { method: "DELETE", pathname: "/api/shopping/:id", token: userToken },
    { method: "POST", pathname: "/api/favorites/products/:id", token: userToken },
    { method: "DELETE", pathname: "/api/favorites/products/:id", token: userToken },
    { method: "POST", pathname: "/api/favorites/templates/:id", token: userToken },
    { method: "DELETE", pathname: "/api/favorites/templates/:id", token: userToken },
    { method: "PUT", pathname: "/api/products/:id", token: adminToken, body: buildRandomProductPayload() },
    { method: "DELETE", pathname: "/api/products/:id", token: adminToken },
    { method: "PATCH", pathname: "/api/users/:id/role", token: adminToken, body: { role: weirdScalar() } }
  ];

  for (let index = 0; index < 25; index += 1) {
    const route = idRoutes[index % idRoutes.length];
    const id = idValues[index % idValues.length];

    cases.push({
      name: `path id ${id} ${route.method} ${route.pathname}`,
      ...route,
      pathname: applyId(route.pathname, id)
    });
  }

  const mediaBodies = [
    { label: "text plain", contentType: "text/plain", rawBody: "plain body" },
    { label: "json string", contentType: "application/json", rawBody: JSON.stringify("plain body") },
    { label: "json null", contentType: "application/json", rawBody: "null" },
    { label: "json array", contentType: "application/json", rawBody: "[{}]" },
    { label: "urlencoded", contentType: "application/x-www-form-urlencoded", rawBody: "title=&calories=abc" },
    { label: "missing content type", contentType: null, rawBody: "{\"title\":\"raw\"}" },
    { label: "deep object", contentType: "application/json", rawBody: JSON.stringify({ a: { b: { c: { d: "x" } } } }) },
    { label: "empty body json header", contentType: "application/json", rawBody: "" }
  ];
  const mediaRoutes = [
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
    { method: "POST", pathname: "/api/products", token: adminToken },
    { method: "PATCH", pathname: "/api/planner/999999/completion", token: userToken },
    { method: "PATCH", pathname: "/api/shopping/999999/check", token: userToken },
    { method: "PATCH", pathname: "/api/users/999999/role", token: adminToken },
    { method: "DELETE", pathname: "/api/shopping/999999", token: userToken }
  ];

  for (let index = 0; index < 15; index += 1) {
    const route = mediaRoutes[index % mediaRoutes.length];
    const media = mediaBodies[index % mediaBodies.length];

    cases.push({
      name: `media ${media.label} ${route.method} ${route.pathname}`,
      ...route,
      contentType: media.contentType,
      rawBody: media.rawBody
    });
  }

  return cases;
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

test("fuzzes 100 adversarial API shapes without server crashes", async (t) => {
  const userToken = await login("demo@nutritrack.local", "Demo123!");
  const adminToken = await login("admin@nutritrack.local", "Admin123!");
  const cases = buildAdversarialApiCases({ userToken, adminToken });

  assert.equal(cases.length, 100, "expected exactly 100 adversarial fuzz cases");

  for (const [index, item] of cases.entries()) {
    await t.test(`${String(index + 1).padStart(3, "0")} ${item.name}`, async () => {
      const response = await sendFuzzCase(item);

      assert.ok(
        response.status < 500,
        `Unexpected ${response.status} on fuzz case ${index + 1}: ${item.method || "GET"} ${item.pathname}`
      );
    });
  }
});
