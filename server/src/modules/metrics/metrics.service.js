const { db } = require("../../db/connection");
const { getLocalDate, getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");

function normalizeMetric(entry) {
  return {
    id: entry.id,
    date: entry.entry_date || entry.date,
    weightKg: entry.weight_kg ?? entry.weightKg,
    bodyFat: entry.body_fat ?? entry.bodyFat,
    waistCm: entry.waist_cm ?? entry.waistCm,
    chestCm: entry.chest_cm ?? entry.chestCm,
    notes: entry.notes || "",
    createdAt: entry.created_at || entry.createdAt
  };
}

function listBodyMetrics(userId, { limit = 12 } = {}) {
  return db
    .prepare(
      `
        SELECT *
        FROM body_metrics
        WHERE user_id = ?
        ORDER BY entry_date DESC, id DESC
        LIMIT ?
      `
    )
    .all(userId, limit)
    .map(normalizeMetric);
}

function getMetricById(userId, metricId) {
  const metric = db
    .prepare(`SELECT * FROM body_metrics WHERE user_id = ? AND id = ?`)
    .get(userId, metricId);

  if (!metric) {
    throw createHttpError(404, "Body metric entry not found");
  }

  return normalizeMetric(metric);
}

function createBodyMetric(userId, payload) {
  const now = getTimestamp();
  const result = db
    .prepare(
      `
        INSERT INTO body_metrics (
          user_id, entry_date, weight_kg, body_fat, waist_cm, chest_cm, notes, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      userId,
      payload.date || getLocalDate(),
      payload.weightKg,
      payload.bodyFat ?? null,
      payload.waistCm ?? null,
      payload.chestCm ?? null,
      payload.notes || "",
      now
    );

  return getMetricById(userId, result.lastInsertRowid);
}

function deleteBodyMetric(userId, metricId) {
  const result = db
    .prepare(`DELETE FROM body_metrics WHERE user_id = ? AND id = ?`)
    .run(userId, metricId);

  if (result.changes === 0) {
    throw createHttpError(404, "Body metric entry not found");
  }

  return { success: true };
}

function getBodyMetricsSummary(userId) {
  const items = listBodyMetrics(userId, { limit: 8 });
  const latest = items[0] || null;
  const previous = items[1] || null;

  return {
    latest,
    previous,
    deltaWeight: latest && previous ? Number((latest.weightKg - previous.weightKg).toFixed(1)) : 0,
    trend: [...items].reverse(),
    entries: items
  };
}

module.exports = {
  createBodyMetric,
  deleteBodyMetric,
  getBodyMetricsSummary,
  listBodyMetrics
};
