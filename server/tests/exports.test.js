const test = require("node:test");
const assert = require("node:assert/strict");

const { buildCsvReport } = require("../src/modules/exports/exports.service");
const { createHttpTestContext } = require("./helpers/test-context");

const { api, login } = createHttpTestContext(test, {
  dbFileName: "exports.db",
  jwtSecret: "exports-secret"
});

test.describe("exports module", () => {
  test("builds csv report with bom and escaped cells", () => {
    const csv = buildCsvReport({
      date: "2026-04-23",
      goals: {
        calories: 2200,
        carbs: 240,
        fat: 70,
        protein: 150
      },
      hydration: {
        totalMl: 900
      },
      meals: [
        {
          calories: 640,
          carbs: 72.4,
          eatenAt: "13:10",
          fat: 18.2,
          grams: 320,
          id: 1,
          mealType: "Обед",
          notes: 'Нота "с кавычками"',
          protein: 34.5,
          title: 'Rice "power" bowl'
        }
      ],
      totals: {
        calories: 840,
        carbs: 91.4,
        fat: 22.1,
        protein: 54.5
      },
      user: {
        email: "demo@example.com"
      }
    });

    assert.ok(csv.startsWith("\uFEFF"));
    assert.match(csv, /nutrition_report/);
    assert.match(csv, /goal_calories/);
    assert.match(csv, /meal_id/);
    assert.match(csv, /"Rice ""power"" bowl"/);
    assert.match(csv, /"Нота ""с кавычками"""/);
  });

  test("returns json daily report with goals, meals and hydration summary", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const response = await api("/api/exports/daily-report", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(response.status, 200);
    assert.equal(typeof response.payload.date, "string");
    assert.equal(typeof response.payload.goals.calories, "number");
    assert.equal(typeof response.payload.hydration.totalMl, "number");
    assert.ok(Array.isArray(response.payload.meals));
  });

  test("returns csv daily report with downloadable headers", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const response = await api("/api/exports/daily-report?format=csv", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/csv/);
    assert.match(response.headers.get("content-disposition"), /nutrition-report-/);
  });

  test("rejects export requests with invalid dates", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const response = await api("/api/exports/daily-report?date=2026-99-99", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(response.status, 400);
  });
});
