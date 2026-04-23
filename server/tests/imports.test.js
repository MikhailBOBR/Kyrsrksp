const test = require("node:test");
const assert = require("node:assert/strict");

const { createHttpTestContext } = require("./helpers/test-context");

const { api, text, login } = createHttpTestContext(test, {
  dbFileName: "imports.db",
  jwtSecret: "imports-secret"
});

test.describe("imports module", () => {
  test("previews and applies meal import from csv", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const content = [
      "title,meal_type,date,eaten_at,grams,calories,protein,fat,carbs,notes",
      '"Импортированный завтрак","Завтрак","2026-04-23","08:10","240","410","18","12","52","CSV импорт"',
      '"Импортированный ужин","Ужин","2026-04-23","19:20","330","560","36","16","49","CSV импорт"'
    ].join("\n");

    const preview = await api("/api/imports/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        dataset: "meals",
        format: "csv",
        content
      })
    });

    assert.equal(preview.status, 200);
    assert.equal(preview.payload.summary.totalRows, 2);
    assert.equal(preview.payload.summary.acceptedRows, 2);
    assert.equal(preview.payload.summary.invalidRows, 0);
    assert.ok(Array.isArray(preview.payload.previewItems));

    const apply = await api("/api/imports/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        dataset: "meals",
        format: "csv",
        content
      })
    });

    assert.equal(apply.status, 201);
    assert.equal(apply.payload.imported, 2);
    assert.equal(apply.payload.skipped, 0);

    const meals = await api("/api/meals?date=2026-04-23", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(meals.status, 200);
    assert.ok(meals.payload.some((item) => item.title === "Импортированный завтрак"));
    assert.ok(meals.payload.some((item) => item.title === "Импортированный ужин"));
  });

  test("downloads import template in tsv format", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const response = await text("/api/imports/template?dataset=templates&format=tsv", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /tab-separated-values|text\/tab-separated-values/);
    assert.match(response.headers.get("content-disposition"), /ration-import-template-templates\.tsv/);
    assert.match(response.payload, /name/);
    assert.match(response.payload, /mealType/);
  });

  test("prevents regular user from importing products", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const response = await api("/api/imports/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        dataset: "products",
        format: "json",
        content: JSON.stringify([
          {
            name: "Тестовый продукт",
            category: "Прочее",
            calories: 10,
            protein: 1,
            fat: 1,
            carbs: 1
          }
        ])
      })
    });

    assert.equal(response.status, 403);
  });

  test("allows admin to import products from json", async () => {
    const token = await login("admin@nutritrack.local", "Admin123!");
    const content = JSON.stringify([
      {
        name: "Импортированный продукт",
        brand: "Admin Lab",
        category: "Прочее",
        calories: 77,
        protein: 4.4,
        fat: 2.1,
        carbs: 8.8
      }
    ]);

    const apply = await api("/api/imports/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        dataset: "products",
        format: "json",
        content
      })
    });

    assert.equal(apply.status, 201);
    assert.equal(apply.payload.imported, 1);

    const products = await api("/api/products?search=Импортированный", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(products.status, 200);
    assert.ok(products.payload.some((item) => item.name === "Импортированный продукт"));
  });
});
