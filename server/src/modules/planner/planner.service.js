const { db } = require("../../db/connection");
const { addDays, getLocalDate, getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");

function normalizePlan(plan) {
  return {
    id: plan.id,
    date: plan.entry_date || plan.date,
    mealType: plan.meal_type || plan.mealType,
    title: plan.title,
    targetCalories: plan.target_calories ?? plan.targetCalories,
    targetProtein: plan.target_protein ?? plan.targetProtein,
    targetFat: plan.target_fat ?? plan.targetFat,
    targetCarbs: plan.target_carbs ?? plan.targetCarbs,
    plannedTime: plan.planned_time || plan.plannedTime,
    completed: Boolean(plan.completed),
    linkedTemplateId: plan.linked_template_id ?? plan.linkedTemplateId ?? null,
    createdAt: plan.created_at || plan.createdAt,
    updatedAt: plan.updated_at || plan.updatedAt
  };
}

function listPlans(userId, { date, dateFrom, dateTo } = {}) {
  const conditions = ["user_id = ?"];
  const parameters = [userId];

  if (date) {
    conditions.push("entry_date = ?");
    parameters.push(date);
  }

  if (dateFrom) {
    conditions.push("entry_date >= ?");
    parameters.push(dateFrom);
  }

  if (dateTo) {
    conditions.push("entry_date <= ?");
    parameters.push(dateTo);
  }

  return db
    .prepare(
      `
        SELECT *
        FROM meal_plans
        WHERE ${conditions.join(" AND ")}
        ORDER BY entry_date ASC, planned_time ASC, id ASC
      `
    )
    .all(...parameters)
    .map(normalizePlan);
}

function getPlanById(userId, planId) {
  const plan = db
    .prepare(`SELECT * FROM meal_plans WHERE user_id = ? AND id = ?`)
    .get(userId, planId);

  if (!plan) {
    throw createHttpError(404, "Meal plan entry not found");
  }

  return normalizePlan(plan);
}

function createPlan(userId, payload) {
  const now = getTimestamp();
  const result = db
    .prepare(
      `
        INSERT INTO meal_plans (
          user_id, entry_date, meal_type, title, target_calories, target_protein,
          target_fat, target_carbs, planned_time, completed, linked_template_id, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      userId,
      payload.date || getLocalDate(),
      payload.mealType,
      payload.title,
      payload.targetCalories,
      payload.targetProtein,
      payload.targetFat,
      payload.targetCarbs,
      payload.plannedTime,
      payload.completed ? 1 : 0,
      payload.linkedTemplateId ?? null,
      now,
      now
    );

  return getPlanById(userId, result.lastInsertRowid);
}

function createPlanFromTemplate(userId, templateId, overrides = {}) {
  const template = db
    .prepare(`SELECT * FROM meal_templates WHERE user_id = ? AND id = ?`)
    .get(userId, templateId);

  if (!template) {
    throw createHttpError(404, "Meal template not found");
  }

  return createPlan(userId, {
    date: overrides.date,
    mealType: overrides.mealType || template.meal_type,
    title: overrides.title || template.name,
    targetCalories: overrides.targetCalories ?? template.calories,
    targetProtein: overrides.targetProtein ?? template.protein,
    targetFat: overrides.targetFat ?? template.fat,
    targetCarbs: overrides.targetCarbs ?? template.carbs,
    plannedTime: overrides.plannedTime || "12:00",
    linkedTemplateId: template.id
  });
}

function setPlanCompletion(userId, planId, completed) {
  getPlanById(userId, planId);

  db.prepare(
    `
      UPDATE meal_plans
      SET completed = ?, updated_at = ?
      WHERE user_id = ? AND id = ?
    `
  ).run(completed ? 1 : 0, getTimestamp(), userId, planId);

  return getPlanById(userId, planId);
}

function deletePlan(userId, planId) {
  const result = db
    .prepare(`DELETE FROM meal_plans WHERE user_id = ? AND id = ?`)
    .run(userId, planId);

  if (result.changes === 0) {
    throw createHttpError(404, "Meal plan entry not found");
  }

  return { success: true };
}

function getPlannerSummary(userId, date = getLocalDate()) {
  const items = listPlans(userId, { date });
  const window = listPlans(userId, { dateFrom: date, dateTo: addDays(date, 6) });
  const completedCount = items.filter((item) => item.completed).length;

  return {
    date,
    items,
    completionRate: items.length ? (completedCount / items.length) * 100 : 0,
    totals: {
      planned: items.length,
      completed: completedCount,
      upcomingWeek: window.length
    }
  };
}

module.exports = {
  createPlan,
  createPlanFromTemplate,
  deletePlan,
  getPlannerSummary,
  listPlans,
  setPlanCompletion
};
