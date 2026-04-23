const { db } = require("../../db/connection");
const { getLocalDate, getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");
const { getProductById } = require("../products/products.service");
const { createPlan } = require("../planner/planner.service");
const { createMeal } = require("../meals/meals.service");

function normalizeRecipe(recipe, items = []) {
  return {
    id: recipe.id,
    title: recipe.title,
    mealType: recipe.meal_type || recipe.mealType,
    totalGrams: recipe.total_grams ?? recipe.totalGrams,
    calories: recipe.calories,
    protein: recipe.protein,
    fat: recipe.fat,
    carbs: recipe.carbs,
    notes: recipe.notes || "",
    instructions: recipe.instructions || "",
    createdAt: recipe.created_at || recipe.createdAt,
    updatedAt: recipe.updated_at || recipe.updatedAt,
    ingredients: items.map((item) => ({
      id: item.id,
      productId: item.product_id || item.productId,
      productName: item.product_name || item.productName,
      grams: item.grams,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs
    }))
  };
}

async function getRecipeItems(recipeId) {
  return db
    .prepare(
      `
        SELECT *
        FROM recipe_items
        WHERE recipe_id = ?
        ORDER BY id ASC
      `
    )
    .all(recipeId);
}

async function listRecipes(userId) {
  const rows = await db
    .prepare(
      `
        SELECT *
        FROM recipes
        WHERE user_id = ?
        ORDER BY updated_at DESC, id DESC
      `
    )
    .all(userId);

  const itemsByRecipe = await Promise.all(
    rows.map(async (recipe) => normalizeRecipe(recipe, await getRecipeItems(recipe.id)))
  );

  return itemsByRecipe;
}

async function getRecipeById(userId, recipeId) {
  const recipe = await db
    .prepare(
      `
        SELECT *
        FROM recipes
        WHERE user_id = ? AND id = ?
      `
    )
    .get(userId, recipeId);

  if (!recipe) {
    throw createHttpError(404, "Recipe not found");
  }

  return normalizeRecipe(recipe, await getRecipeItems(recipe.id));
}

async function buildRecipeIngredients(ingredients) {
  return Promise.all(
    ingredients.map(async (item) => {
      const product = await getProductById(item.productId);
    const ratio = item.grams / 100;

      return {
        productId: product.id,
        productName: product.name,
        grams: item.grams,
        calories: Number((product.calories * ratio).toFixed(1)),
        protein: Number((product.protein * ratio).toFixed(1)),
        fat: Number((product.fat * ratio).toFixed(1)),
        carbs: Number((product.carbs * ratio).toFixed(1))
      };
    })
  );
}

function buildRecipeTotals(items) {
  return items.reduce(
    (accumulator, item) => {
      accumulator.totalGrams += item.grams;
      accumulator.calories += item.calories;
      accumulator.protein += item.protein;
      accumulator.fat += item.fat;
      accumulator.carbs += item.carbs;
      return accumulator;
    },
    { totalGrams: 0, calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

async function createRecipe(userId, payload) {
  const items = await buildRecipeIngredients(payload.ingredients);

  if (!items.length) {
    throw createHttpError(400, 'Field "ingredients" must contain at least one ingredient');
  }

  const totals = buildRecipeTotals(items);
  const now = getTimestamp();
  const result = await db
    .prepare(
      `
        INSERT INTO recipes (
          user_id, title, meal_type, total_grams, calories, protein, fat, carbs, notes, instructions, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      userId,
      payload.title,
      payload.mealType,
      totals.totalGrams,
      totals.calories,
      totals.protein,
      totals.fat,
      totals.carbs,
      payload.notes || "",
      payload.instructions || "",
      now,
      now
    );

  const recipeId = result.lastInsertRowid;
  const statement = db.prepare(
    `
      INSERT INTO recipe_items (
        recipe_id, product_id, product_name, grams, calories, protein, fat, carbs, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  );

  for (const item of items) {
    await statement.run(
      recipeId,
      item.productId,
      item.productName,
      item.grams,
      item.calories,
      item.protein,
      item.fat,
      item.carbs,
      now
    );
  }

  return getRecipeById(userId, recipeId);
}

async function applyRecipe(userId, recipeId, overrides = {}) {
  const recipe = await getRecipeById(userId, recipeId);
  const multiplier = overrides.multiplier ?? 1;

  return createMeal(userId, {
    title: overrides.title || recipe.title,
    mealType: overrides.mealType || recipe.mealType,
    date: overrides.date || getLocalDate(),
    eatenAt: overrides.eatenAt || "12:00",
    grams: Number((recipe.totalGrams * multiplier).toFixed(1)),
    calories: Number((recipe.calories * multiplier).toFixed(1)),
    protein: Number((recipe.protein * multiplier).toFixed(1)),
    fat: Number((recipe.fat * multiplier).toFixed(1)),
    carbs: Number((recipe.carbs * multiplier).toFixed(1)),
    notes: overrides.notes || recipe.notes || `Рецепт: ${recipe.title}`
  });
}

async function createPlanFromRecipe(userId, recipeId, overrides = {}) {
  const recipe = await getRecipeById(userId, recipeId);
  const multiplier = overrides.multiplier ?? 1;

  return createPlan(userId, {
    title: overrides.title || recipe.title,
    mealType: overrides.mealType || recipe.mealType,
    date: overrides.date || getLocalDate(),
    plannedTime: overrides.plannedTime || "13:00",
    targetCalories: Number((recipe.calories * multiplier).toFixed(1)),
    targetProtein: Number((recipe.protein * multiplier).toFixed(1)),
    targetFat: Number((recipe.fat * multiplier).toFixed(1)),
    targetCarbs: Number((recipe.carbs * multiplier).toFixed(1))
  });
}

async function deleteRecipe(userId, recipeId) {
  const result = await db.prepare(`DELETE FROM recipes WHERE user_id = ? AND id = ?`).run(userId, recipeId);

  if (result.changes === 0) {
    throw createHttpError(404, "Recipe not found");
  }

  return { success: true };
}

module.exports = {
  applyRecipe,
  createPlanFromRecipe,
  createRecipe,
  deleteRecipe,
  getRecipeById,
  listRecipes
};
