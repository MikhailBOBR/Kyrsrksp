const test = require("node:test");
const assert = require("node:assert/strict");

<<<<<<< ours
const { createHttpTestContext } = require("./helpers/test-context");

const { api, login } = createHttpTestContext(test, {
=======
const { buildCsvReport, buildExcelCsvReport } = require("../src/modules/exports/exports.service");
const { createHttpTestContext } = require("./helpers/test-context");

const { api, bytes, login } = createHttpTestContext(test, {
>>>>>>> theirs
  dbFileName: "exports.db",
  jwtSecret: "exports-secret"
});

test.describe("exports module", () => {
<<<<<<< ours
=======
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

    assert.match(csv, /^sep=;\r\n/);
    assert.match(csv, /nutrition_report/);
    assert.match(csv, /goal_calories/);
    assert.match(csv, /meal_id/);
    assert.match(csv, /"nutrition_report";"Рацион"/);
    assert.match(csv, /"Rice ""power"" bowl"/);
    assert.match(csv, /"Нота ""с кавычками"""/);
    assert.match(csv, /"total_carbs";"91,4"/);

    const excelCsv = buildExcelCsvReport({
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
      meals: [],
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
    assert.deepEqual([...excelCsv.subarray(0, 2)], [0xff, 0xfe]);
    assert.match(excelCsv.subarray(2).toString("utf16le"), /^sep=;\r\n/);
  });

>>>>>>> theirs
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

<<<<<<< ours
  test("rejects removed csv daily report requests", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const response = await api("/api/exports/daily-report?format=csv", {
=======
  test("returns csv daily report with downloadable headers", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const response = await bytes("/api/exports/daily-report?format=csv", {
>>>>>>> theirs
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

<<<<<<< ours
    assert.equal(response.status, 400);
    assert.equal(response.payload.error, "Export format is not supported");
=======
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/csv/);
    assert.match(response.headers.get("content-type"), /utf-16le/);
    assert.match(response.headers.get("content-disposition"), /nutrition-report-/);
    assert.deepEqual([...response.payload.subarray(0, 2)], [0xff, 0xfe]);
    const csv = response.payload.subarray(2).toString("utf16le");
    assert.match(csv, /^sep=;\r\n/);
    assert.match(csv, /"nutrition_report";"Рацион"/);
>>>>>>> theirs
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
