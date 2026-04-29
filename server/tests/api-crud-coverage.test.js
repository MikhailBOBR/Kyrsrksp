const test = require("node:test");
const assert = require("node:assert/strict");

const { createHttpTestContext } = require("./helpers/test-context");

const { api, login } = createHttpTestContext(test, {
  dbFileName: "api-crud-coverage.db",
  jwtSecret: "api-crud-coverage-secret"
});

async function authorized(token, pathname, options = {}) {
  return api(pathname, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
}

function jsonRequest(token, method, body) {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  };
}

test.describe("full CRUD and edge API coverage", () => {
  test("covers goals read and manual update flows", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");

    const current = await authorized(token, "/api/goals");
    assert.equal(current.status, 200);
    assert.ok(current.payload.calories > 0);

    const updated = await api(
      "/api/goals",
      jsonRequest(token, "PUT", {
        calories: 2250,
        protein: 145,
        fat: 72,
        carbs: 245
      })
    );

    assert.equal(updated.status, 200);
    assert.equal(updated.payload.calories, 2250);
    assert.equal(updated.payload.carbs, 245);
  });

  test("covers product search, update, delete and not-found branches", async () => {
    const adminToken = await login("admin@nutritrack.local", "Admin123!");

    const created = await api(
      "/api/products",
      jsonRequest(adminToken, "POST", {
        name: "Coverage Product",
        brand: "QA",
        category: "Прочее",
        calories: 123,
        protein: 12,
        fat: 4,
        carbs: 10
      })
    );

    assert.equal(created.status, 201);

    const filtered = await api("/api/products?search=Coverage&category=Прочее");
    assert.equal(filtered.status, 200);
    assert.ok(filtered.payload.some((item) => item.id === created.payload.id));

    const updated = await api(
      `/api/products/${created.payload.id}`,
      jsonRequest(adminToken, "PUT", {
        name: "Coverage Product Updated",
        brand: "",
        category: "Прочее",
        calories: 140,
        protein: 14,
        fat: 5,
        carbs: 11
      })
    );

    assert.equal(updated.status, 200);
    assert.equal(updated.payload.brand, null);
    assert.equal(updated.payload.calories, 140);

    const deleted = await authorized(adminToken, `/api/products/${created.payload.id}`, {
      method: "DELETE"
    });
    assert.equal(deleted.status, 200);
    assert.equal(deleted.payload.success, true);

    const deletedAgain = await authorized(adminToken, `/api/products/${created.payload.id}`, {
      method: "DELETE"
    });
    assert.equal(deletedAgain.status, 404);
  });

  test("covers meals, templates, recipes and planner destructive flows", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const date = "2026-04-29";

    const meal = await api(
      "/api/meals",
      jsonRequest(token, "POST", {
        title: "Coverage Meal",
        mealType: "Обед",
        date,
        eatenAt: "12:45",
        grams: 310,
        calories: 520,
        protein: 38,
        fat: 17,
        carbs: 54,
        notes: ""
      })
    );
    assert.equal(meal.status, 201);

    const updatedMeal = await api(
      `/api/meals/${meal.payload.id}`,
      jsonRequest(token, "PUT", {
        title: "Coverage Meal Updated",
        mealType: "Ужин",
        date,
        eatenAt: "19:10",
        grams: 280,
        calories: 490,
        protein: 35,
        fat: 16,
        carbs: 48,
        notes: "updated"
      })
    );
    assert.equal(updatedMeal.status, 200);
    assert.equal(updatedMeal.payload.mealType, "Ужин");

    const fromMealTemplate = await api(
      `/api/templates/from-meal/${meal.payload.id}`,
      jsonRequest(token, "POST", {
        name: "Coverage Template From Meal"
      })
    );
    assert.equal(fromMealTemplate.status, 201);

    const appliedTemplate = await api(
      `/api/templates/${fromMealTemplate.payload.id}/apply`,
      jsonRequest(token, "POST", {
        date,
        eatenAt: "08:20",
        title: "Coverage Template Applied",
        mealType: "Завтрак"
      })
    );
    assert.equal(appliedTemplate.status, 201);
    assert.equal(appliedTemplate.payload.title, "Coverage Template Applied");

    const deletedTemplate = await authorized(token, `/api/templates/${fromMealTemplate.payload.id}`, {
      method: "DELETE"
    });
    assert.equal(deletedTemplate.status, 200);
    assert.equal(deletedTemplate.payload.success, true);

    const products = await api("/api/products");
    assert.equal(products.status, 200);
    assert.ok(products.payload.length >= 1);

    const recipe = await api(
      "/api/recipes",
      jsonRequest(token, "POST", {
        title: "Coverage Recipe",
        mealType: "Обед",
        notes: "",
        instructions: "",
        ingredients: [{ productId: products.payload[0].id, grams: 150 }]
      })
    );
    assert.equal(recipe.status, 201);

    const recipeList = await authorized(token, "/api/recipes");
    assert.equal(recipeList.status, 200);
    assert.ok(recipeList.payload.some((item) => item.id === recipe.payload.id));

    const deletedRecipe = await authorized(token, `/api/recipes/${recipe.payload.id}`, {
      method: "DELETE"
    });
    assert.equal(deletedRecipe.status, 200);

    const manualPlan = await api(
      "/api/planner",
      jsonRequest(token, "POST", {
        date,
        mealType: "Перекус",
        title: "Coverage Manual Plan",
        plannedTime: "16:10",
        targetCalories: 210,
        targetProtein: 18,
        targetFat: 6,
        targetCarbs: 20
      })
    );
    assert.equal(manualPlan.status, 201);

    const plannerSummary = await authorized(token, `/api/planner?date=${date}`);
    assert.equal(plannerSummary.status, 200);
    assert.ok(plannerSummary.payload.items.some((item) => item.id === manualPlan.payload.id));

    const uncompleted = await api(
      `/api/planner/${manualPlan.payload.id}/completion`,
      jsonRequest(token, "PATCH", {
        completed: false
      })
    );
    assert.equal(uncompleted.status, 200);
    assert.equal(uncompleted.payload.completed, false);

    const deletedPlan = await authorized(token, `/api/planner/${manualPlan.payload.id}`, {
      method: "DELETE"
    });
    assert.equal(deletedPlan.status, 200);

    const deletedMeal = await authorized(token, `/api/meals/${meal.payload.id}`, {
      method: "DELETE"
    });
    assert.equal(deletedMeal.status, 200);

    const missingMeal = await authorized(token, `/api/meals/${meal.payload.id}`, {
      method: "DELETE"
    });
    assert.equal(missingMeal.status, 404);
  });

  test("covers daily controls, wellbeing, metrics and note deletion", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const date = "2026-04-28";

    const hydration = await api(
      "/api/hydration",
      jsonRequest(token, "POST", {
        date,
        amountMl: 450,
        loggedAt: "10:30"
      })
    );
    assert.equal(hydration.status, 201);

    const hydrationSummary = await authorized(token, `/api/hydration?date=${date}`);
    assert.equal(hydrationSummary.status, 200);
    assert.ok(hydrationSummary.payload.entries.some((item) => item.id === hydration.payload.id));

    const deletedHydration = await authorized(token, `/api/hydration/${hydration.payload.id}`, {
      method: "DELETE"
    });
    assert.equal(deletedHydration.status, 200);

    const checkin = await api(
      "/api/checkins",
      jsonRequest(token, "PUT", {
        date,
        mood: 4,
        energy: 5,
        stress: 1,
        hunger: 3,
        sleepHours: 8,
        notes: ""
      })
    );
    assert.equal(checkin.status, 200);

    const deletedCheckin = await authorized(token, `/api/checkins?date=${date}`, {
      method: "DELETE"
    });
    assert.equal(deletedCheckin.status, 200);
    assert.equal(deletedCheckin.payload.success, true);

    const metric = await api(
      "/api/metrics",
      jsonRequest(token, "POST", {
        date,
        weightKg: 78.4,
        bodyFat: 17.4,
        waistCm: 80.1,
        chestCm: 101.2,
        notes: ""
      })
    );
    assert.equal(metric.status, 201);

    const deletedMetric = await authorized(token, `/api/metrics/${metric.payload.id}`, {
      method: "DELETE"
    });
    assert.equal(deletedMetric.status, 200);

    const note = await api(
      "/api/day-notes",
      jsonRequest(token, "PUT", {
        date,
        title: "Coverage Note",
        focus: "Tests",
        wins: "Coverage",
        improvements: "More edge cases",
        notes: ""
      })
    );
    assert.equal(note.status, 200);
    assert.equal(note.payload.hasContent, true);

    const recent = await authorized(token, "/api/day-notes/recent?limit=2");
    assert.equal(recent.status, 200);
    assert.ok(Array.isArray(recent.payload));

    const deletedNote = await authorized(token, `/api/day-notes?date=${date}`, {
      method: "DELETE"
    });
    assert.equal(deletedNote.status, 200);
    assert.equal(deletedNote.payload.hasContent, false);
  });

  test("covers shopping and favorites create, filter, clear and remove flows", async () => {
    const token = await login("demo@nutritrack.local", "Demo123!");
    const products = await api("/api/products");
    const templates = await authorized(token, "/api/templates");

    assert.ok(products.payload.length >= 1);
    assert.ok(templates.payload.length >= 1);

    const shoppingItem = await api(
      "/api/shopping",
      jsonRequest(token, "POST", {
        title: "Coverage Shopping Item",
        category: "Прочее",
        quantity: 1.5,
        unit: "кг",
        plannedFor: "2026-04-30",
        source: "manual-test",
        notes: ""
      })
    );
    assert.equal(shoppingItem.status, 201);

    const pendingShopping = await authorized(token, "/api/shopping?checked=false");
    assert.equal(pendingShopping.status, 200);
    assert.ok(pendingShopping.payload.items.some((item) => item.id === shoppingItem.payload.id));

    const checked = await api(
      `/api/shopping/${shoppingItem.payload.id}/check`,
      jsonRequest(token, "PATCH", {
        checked: true
      })
    );
    assert.equal(checked.status, 200);
    assert.equal(checked.payload.checked, true);

    const checkedShopping = await authorized(token, "/api/shopping?checked=true");
    assert.equal(checkedShopping.status, 200);
    assert.ok(checkedShopping.payload.items.some((item) => item.id === shoppingItem.payload.id));

    const cleared = await authorized(token, "/api/shopping/checked", {
      method: "DELETE"
    });
    assert.equal(cleared.status, 200);
    assert.ok(cleared.payload.removed >= 1);

    const fromProduct = await api(
      `/api/shopping/from-product/${products.payload[0].id}`,
      jsonRequest(token, "POST", {
        quantity: 3,
        unit: "шт",
        plannedFor: "2026-04-30",
        notes: ""
      })
    );
    assert.equal(fromProduct.status, 201);

    const deletedShopping = await authorized(token, `/api/shopping/${fromProduct.payload.id}`, {
      method: "DELETE"
    });
    assert.equal(deletedShopping.status, 200);

    const productFavorite = await api(
      `/api/favorites/products/${products.payload[0].id}`,
      jsonRequest(token, "POST", {})
    );
    assert.equal(productFavorite.status, 201);

    const templateFavorite = await api(
      `/api/favorites/templates/${templates.payload[0].id}`,
      jsonRequest(token, "POST", {})
    );
    assert.equal(templateFavorite.status, 201);

    const removedProductFavorite = await authorized(token, `/api/favorites/products/${products.payload[0].id}`, {
      method: "DELETE"
    });
    assert.equal(removedProductFavorite.status, 200);

    const removedTemplateFavorite = await authorized(token, `/api/favorites/templates/${templates.payload[0].id}`, {
      method: "DELETE"
    });
    assert.equal(removedTemplateFavorite.status, 200);

    const missingTemplateFavorite = await authorized(token, `/api/favorites/templates/${templates.payload[0].id}`, {
      method: "DELETE"
    });
    assert.equal(missingTemplateFavorite.status, 404);
  });
});
