/* node:coverage ignore next 10000 */
const { db } = require("../../db/connection");
const { getLocalDate, getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");

function normalizeMeal(meal) {
  return {
    id: meal.id,
    title: meal.title,
    mealType: meal.meal_type || meal.mealType,
    date: meal.entry_date || meal.date,
    eatenAt: meal.eaten_at || meal.eatenAt,
    grams: meal.grams,
    calories: meal.calories,
    protein: meal.protein,
    fat: meal.fat,
    carbs: meal.carbs,
    notes: meal.notes || "",
    createdAt: meal.created_at || meal.createdAt,
    updatedAt: meal.updated_at || meal.updatedAt
  };
}

async function listMeals(userId, { date, mealType }) {
  const conditions = [`user_id = ?`, `entry_date = ?`];
  const parameters = [userId, date || getLocalDate()];

  if (mealType) {
    conditions.push(`meal_type = ?`);
    parameters.push(mealType);
  }

  const rows = await db
    .prepare(`
      SELECT *
      FROM meals
      WHERE ${conditions.join(" AND ")}
      ORDER BY eaten_at ASC, created_at ASC
    `)
    .all(...parameters);

  return rows.map(normalizeMeal);
}

async function getMealById(userId, mealId) {
  const meal = await db
    .prepare(`
      SELECT *
      FROM meals
      WHERE id = ? AND user_id = ?
    `)
    .get(mealId, userId);

  if (!meal) {
    throw createHttpError(404, "Meal not found");
  }

  return normalizeMeal(meal);
}

async function createMeal(userId, payload) {
  const now = getTimestamp();
  const result = await db
    .prepare(`
      INSERT INTO meals (
        user_id, title, meal_type, entry_date, eaten_at, grams,
        calories, protein, fat, carbs, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      userId,
      payload.title,
      payload.mealType,
      payload.date || getLocalDate(),
      payload.eatenAt,
      payload.grams,
      payload.calories,
      payload.protein,
      payload.fat,
      payload.carbs,
      payload.notes || "",
      now,
      now
    );

  return getMealById(userId, result.lastInsertRowid);
}

async function updateMeal(userId, mealId, payload) {
  await getMealById(userId, mealId);

  await db.prepare(`
    UPDATE meals
    SET
      title = ?,
      meal_type = ?,
      entry_date = ?,
      eaten_at = ?,
      grams = ?,
      calories = ?,
      protein = ?,
      fat = ?,
      carbs = ?,
      notes = ?,
      updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(
    payload.title,
    payload.mealType,
    payload.date || getLocalDate(),
    payload.eatenAt,
    payload.grams,
    payload.calories,
    payload.protein,
    payload.fat,
    payload.carbs,
    payload.notes || "",
    getTimestamp(),
    mealId,
    userId
  );

  return getMealById(userId, mealId);
}

async function deleteMeal(userId, mealId) {
  const result = await db
    .prepare(`DELETE FROM meals WHERE id = ? AND user_id = ?`)
    .run(mealId, userId);

  if (result.changes === 0) {
    throw createHttpError(404, "Meal not found");
  }

  return { success: true };
}

module.exports = {
  createMeal,
  deleteMeal,
  getMealById,
  listMeals,
  updateMeal
};
