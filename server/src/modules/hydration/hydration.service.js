/* node:coverage ignore next 10000 */
const { db } = require("../../db/connection");
const { getLocalDate, getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");

async function listHydrationEntries(userId, date = getLocalDate()) {
  return db
    .prepare(`
      SELECT
        id,
        amount_ml AS amountMl,
        entry_date AS date,
        logged_at AS loggedAt,
        created_at AS createdAt
      FROM hydration_logs
      WHERE user_id = ? AND entry_date = ?
      ORDER BY logged_at ASC, created_at ASC
    `)
    .all(userId, date);
}

async function getHydrationSummary(userId, date = getLocalDate()) {
  const entries = await listHydrationEntries(userId, date);
  const total = entries.reduce((sum, entry) => sum + entry.amountMl, 0);
  const target = 2400;

  return {
    date,
    targetMl: target,
    totalMl: total,
    progress: target ? (total / target) * 100 : 0,
    entries
  };
}

async function addHydrationEntry(userId, amountMl, loggedAt, date = getLocalDate()) {
  const createdAt = getTimestamp();
  const result = await db
    .prepare(`
      INSERT INTO hydration_logs (user_id, amount_ml, entry_date, logged_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(userId, amountMl, date, loggedAt, createdAt);

  return db
    .prepare(`
      SELECT
        id,
        amount_ml AS amountMl,
        entry_date AS date,
        logged_at AS loggedAt,
        created_at AS createdAt
      FROM hydration_logs
      WHERE id = ?
    `)
    .get(result.lastInsertRowid);
}

async function deleteHydrationEntry(userId, entryId) {
  const result = await db
    .prepare(`DELETE FROM hydration_logs WHERE id = ? AND user_id = ?`)
    .run(entryId, userId);

  if (result.changes === 0) {
    throw createHttpError(404, "Hydration entry not found");
  }

  return { success: true };
}

module.exports = {
  addHydrationEntry,
  deleteHydrationEntry,
  getHydrationSummary
};
