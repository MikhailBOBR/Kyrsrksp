const test = require("node:test");
const assert = require("node:assert/strict");

const { createHttpTestContext } = require("./helpers/test-context");

const { api, login } = createHttpTestContext(test, {
  dbFileName: "contracts.db",
  jwtSecret: "contracts-secret"
});

test.describe("negative api contracts", () => {
  test("rejects invalid login and invalid registration payloads", async () => {
    const badLogin = await api("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "demo@nutritrack.local",
        password: "wrong-password"
      })
    });

    const badRegister = await api("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "QA User",
        email: "broken-email",
        password: "123"
      })
    });

    assert.equal(badLogin.status, 401);
    assert.equal(badRegister.status, 400);
  });

  test("rejects invalid meal payloads", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");

    const response = await api("/api/meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "",
        mealType: "Late meal",
        eatenAt: "25:99",
        grams: -10,
        calories: -100,
        protein: -1,
        fat: -1,
        carbs: -1
      })
    });

    assert.equal(response.status, 400);
  });

  test("rejects invalid recipe and planner payloads", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");

    const recipe = await api("/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "Broken recipe",
        mealType: "РћР±РµРґ",
        ingredients: []
      })
    });

    const planner = await api("/api/planner/generate-week", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        startDate: "2026-15-99",
        days: 5
      })
    });

    assert.equal(recipe.status, 400);
    assert.equal(planner.status, 400);
  });

  test("rejects invalid goal updates and invalid authorization token", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");

    const badGoals = await api("/api/goals", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        calories: -1,
        protein: 100,
        fat: 50,
        carbs: 200
      })
    });

    const badToken = await api("/api/dashboard", {
      headers: {
        Authorization: "Bearer broken.token.value"
      }
    });

    assert.equal(badGoals.status, 400);
    assert.equal(badToken.status, 401);
  });
});
