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

async function listPlans(userId, { date, dateFrom, dateTo } = {}) {
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

  const rows = await db
    .prepare(
      `
        SELECT *
        FROM meal_plans
        WHERE ${conditions.join(" AND ")}
        ORDER BY entry_date ASC, planned_time ASC, id ASC
      `
    )
    .all(...parameters);

  return rows.map(normalizePlan);
}

async function getPlanById(userId, planId) {
  const plan = await db
    .prepare(`SELECT * FROM meal_plans WHERE user_id = ? AND id = ?`)
    .get(userId, planId);

  if (!plan) {
    throw createHttpError(404, "Meal plan entry not found");
  }

  return normalizePlan(plan);
}

async function createPlan(userId, payload) {
  const now = getTimestamp();
  const result = await db
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

async function createPlanFromTemplate(userId, templateId, overrides = {}) {
  const template = await db
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

async function setPlanCompletion(userId, planId, completed) {
  await getPlanById(userId, planId);

  await db.prepare(
    `
      UPDATE meal_plans
      SET completed = ?, updated_at = ?
      WHERE user_id = ? AND id = ?
    `
  ).run(completed ? 1 : 0, getTimestamp(), userId, planId);

  return getPlanById(userId, planId);
}

async function deletePlan(userId, planId) {
  const result = await db
    .prepare(`DELETE FROM meal_plans WHERE user_id = ? AND id = ?`)
    .run(userId, planId);

  if (result.changes === 0) {
    throw createHttpError(404, "Meal plan entry not found");
  }

  return { success: true };
}

async function getPlannerSummary(userId, date = getLocalDate()) {
  const [items, window] = await Promise.all([
    listPlans(userId, { date }),
    listPlans(userId, { dateFrom: date, dateTo: addDays(date, 6) })
  ]);
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

function getPlannedTimeByMealType(mealType) {
  if (mealType === "Завтрак") {
    return "08:00";
  }

  if (mealType === "Обед") {
    return "13:00";
  }

  if (mealType === "Ужин") {
    return "19:00";
  }

  return "16:30";
}

async function buildGenerationPool(userId) {
  const { listTemplates } = require("../templates/templates.service");
  const { listRecipes } = require("../recipes/recipes.service");

  const [templates, recipes] = await Promise.all([listTemplates(userId), listRecipes(userId)]);
  const templatePool = templates.map((item) => ({
    sourceType: "template",
    id: item.id,
    title: item.name,
    mealType: item.mealType,
    calories: item.calories,
    protein: item.protein,
    fat: item.fat,
    carbs: item.carbs
  }));
  const recipePool = recipes.map((item) => ({
    sourceType: "recipe",
    id: item.id,
    title: item.title,
    mealType: item.mealType,
    calories: item.calories,
    protein: item.protein,
    fat: item.fat,
    carbs: item.carbs
  }));

  return {
    all: [...recipePool, ...templatePool],
    byMealType: {
      Завтрак: [...recipePool, ...templatePool].filter((item) => item.mealType === "Завтрак"),
      Обед: [...recipePool, ...templatePool].filter((item) => item.mealType === "Обед"),
      Ужин: [...recipePool, ...templatePool].filter((item) => item.mealType === "Ужин"),
      Перекус: [...recipePool, ...templatePool].filter((item) => item.mealType === "Перекус")
    }
  };
}

function pickPlanSource(pool, mealType, index) {
  const scopedPool = pool.byMealType[mealType];
  const targetPool = scopedPool.length ? scopedPool : pool.all;

  return targetPool[index % targetPool.length];
}

async function generateWeeklyPlan(
  userId,
  { startDate = getLocalDate(), days = 7, includeSnack = true, replaceExisting = true } = {}
) {
  const safeDays = Math.min(Math.max(Number(days) || 7, 1), 14);
  const endDate = addDays(startDate, safeDays - 1);
  const pool = await buildGenerationPool(userId);

  if (!pool.all.length) {
    throw createHttpError(
      400,
      "No templates or recipes available for week generation"
    );
  }

  if (replaceExisting) {
    await db.prepare(
      `
        DELETE FROM meal_plans
        WHERE user_id = ? AND entry_date >= ? AND entry_date <= ?
      `
    ).run(userId, startDate, endDate);
  }

  const slots = includeSnack
    ? ["Завтрак", "Обед", "Перекус", "Ужин"]
    : ["Завтрак", "Обед", "Ужин"];

  for (let dayIndex = 0; dayIndex < safeDays; dayIndex += 1) {
    const date = addDays(startDate, dayIndex);

    for (const [slotIndex, mealType] of slots.entries()) {
      const source = pickPlanSource(pool, mealType, dayIndex + slotIndex);

      await createPlan(userId, {
        date,
        title:
          source.sourceType === "recipe"
            ? `${source.title} · рецепт`
            : `${source.title} · шаблон`,
        mealType,
        plannedTime: getPlannedTimeByMealType(mealType),
        targetCalories: source.calories,
        targetProtein: source.protein,
        targetFat: source.fat,
        targetCarbs: source.carbs
      });
    }
  }

  return {
    startDate,
    endDate,
    days: safeDays,
    includeSnack,
    items: await listPlans(userId, {
      dateFrom: startDate,
      dateTo: endDate
    })
  };
}

module.exports = {
  createPlan,
  createPlanFromTemplate,
  deletePlan,
  generateWeeklyPlan,
  getPlannerSummary,
  listPlans,
  setPlanCompletion
};
