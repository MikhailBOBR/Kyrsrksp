const { db } = require("../../db/connection");
const { getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");

function getGoals(userId) {
  const goals = db
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

function updateGoals(userId, payload) {
  db.prepare(`
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

module.exports = {
  getGoals,
  updateGoals
};
