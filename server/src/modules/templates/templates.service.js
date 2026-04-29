/* node:coverage ignore next 10000 */
const { db } = require("../../db/connection");
const { getLocalDate, getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");
const { getMealById } = require("../meals/meals.service");

function normalizeTemplate(template) {
  return {
    id: template.id,
    name: template.name,
    mealType: template.meal_type || template.mealType,
    grams: template.grams,
    calories: template.calories,
    protein: template.protein,
    fat: template.fat,
    carbs: template.carbs,
    notes: template.notes || "",
    usageCount: template.usage_count || template.usageCount || 0,
    createdAt: template.created_at || template.createdAt,
    updatedAt: template.updated_at || template.updatedAt
  };
}

async function listTemplates(userId) {
  const rows = await db
    .prepare(`
      SELECT *
      FROM meal_templates
      WHERE user_id = ?
      ORDER BY usage_count DESC, updated_at DESC
    `)
    .all(userId);

  return rows.map(normalizeTemplate);
}

async function getTemplateById(userId, templateId) {
  const template = await db
    .prepare(`SELECT * FROM meal_templates WHERE id = ? AND user_id = ?`)
    .get(templateId, userId);

  if (!template) {
    throw createHttpError(404, "Meal template not found");
  }

  return normalizeTemplate(template);
}

async function createTemplate(userId, payload) {
  const now = getTimestamp();
  const result = await db
    .prepare(`
      INSERT INTO meal_templates (
        user_id, name, meal_type, grams, calories, protein, fat, carbs, notes, usage_count, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `)
    .run(
      userId,
      payload.name,
      payload.mealType,
      payload.grams,
      payload.calories,
      payload.protein,
      payload.fat,
      payload.carbs,
      payload.notes || "",
      now,
      now
    );

  return getTemplateById(userId, result.lastInsertRowid);
}

async function createTemplateFromMeal(userId, mealId, name) {
  const meal = await getMealById(userId, mealId);

  return createTemplate(userId, {
    name: name || meal.title,
    mealType: meal.mealType,
    grams: meal.grams,
    calories: meal.calories,
    protein: meal.protein,
    fat: meal.fat,
    carbs: meal.carbs,
    notes: meal.notes
  });
}

async function applyTemplate(userId, templateId, overrides = {}) {
  const template = await getTemplateById(userId, templateId);
  const now = getTimestamp();
  const entryDate = overrides.date || getLocalDate();
  const eatenAt = overrides.eatenAt || "12:00";

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
      overrides.title || template.name,
      overrides.mealType || template.mealType,
      entryDate,
      eatenAt,
      overrides.grams ?? template.grams,
      overrides.calories ?? template.calories,
      overrides.protein ?? template.protein,
      overrides.fat ?? template.fat,
      overrides.carbs ?? template.carbs,
      overrides.notes ?? template.notes,
      now,
      now
    );

  await db.prepare(`
    UPDATE meal_templates
    SET usage_count = usage_count + 1, updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(now, templateId, userId);

  return db
    .prepare(`
      SELECT
        id,
        title,
        meal_type AS mealType,
        entry_date AS date,
        eaten_at AS eatenAt,
        grams,
        calories,
        protein,
        fat,
        carbs,
        notes,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM meals
      WHERE id = ?
    `)
    .get(result.lastInsertRowid);
}

async function deleteTemplate(userId, templateId) {
  const result = await db
    .prepare(`DELETE FROM meal_templates WHERE id = ? AND user_id = ?`)
    .run(templateId, userId);

  if (result.changes === 0) {
    throw createHttpError(404, "Meal template not found");
  }

  return { success: true };
}

module.exports = {
  applyTemplate,
  createTemplate,
  createTemplateFromMeal,
  deleteTemplate,
  getTemplateById,
  listTemplates
};
