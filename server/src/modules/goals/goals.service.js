const { db } = require("../../db/connection");
const { getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");

const goalPresets = [
  {
    id: "maintenance",
    name: "Поддержание",
    description: "Ровный базовый режим без агрессивного дефицита или профицита.",
    calories: 2200,
    protein: 140,
    fat: 70,
    carbs: 240
  },
  {
    id: "cut",
    name: "Снижение веса",
    description: "Умеренный дефицит калорий с упором на белок.",
    calories: 1900,
    protein: 155,
    fat: 58,
    carbs: 175
  },
  {
    id: "high-protein",
    name: "Высокий белок",
    description: "Подходит для насыщения и контроля мышечного восстановления.",
    calories: 2100,
    protein: 175,
    fat: 65,
    carbs: 180
  },
  {
    id: "mass",
    name: "Набор массы",
    description: "Умеренный профицит с усилением углеводов и белка.",
    calories: 2650,
    protein: 170,
    fat: 80,
    carbs: 315
  }
];

async function getGoals(userId) {
  const goals = await db
    .prepare(`
      SELECT calories, protein, fat, carbs, updated_at AS updatedAt
      FROM goals
      WHERE user_id = ?
    `)
    .get(userId);

  if (!goals) {
    throw createHttpError(404, "Goals not found");
  }

  return goals;
}

async function updateGoals(userId, payload) {
  await db.prepare(`
    UPDATE goals
    SET calories = ?, protein = ?, fat = ?, carbs = ?, updated_at = ?
    WHERE user_id = ?
  `).run(
    payload.calories,
    payload.protein,
    payload.fat,
    payload.carbs,
    getTimestamp(),
    userId
  );

  return getGoals(userId);
}

function listGoalPresets() {
  return goalPresets;
}

async function applyGoalPreset(userId, presetId) {
  const preset = goalPresets.find((item) => item.id === presetId);

  if (!preset) {
    throw createHttpError(404, "Goal preset not found");
  }

  return {
    preset,
    goals: await updateGoals(userId, {
      calories: preset.calories,
      protein: preset.protein,
      fat: preset.fat,
      carbs: preset.carbs
    })
  };
}

module.exports = {
  applyGoalPreset,
  getGoals,
  listGoalPresets,
  updateGoals
};
