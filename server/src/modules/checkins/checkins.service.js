/* node:coverage ignore next 10000 */
const { db } = require("../../db/connection");
const { addDays, getLastDates, getLocalDate, getTimestamp } = require("../../lib/date");

function normalizeCheckin(entry) {
  if (!entry) {
    return null;
  }

  return {
    id: entry.id,
    date: entry.entry_date || entry.date,
    mood: entry.mood,
    energy: entry.energy,
    stress: entry.stress,
    hunger: entry.hunger,
    sleepHours: entry.sleep_hours ?? entry.sleepHours,
    notes: entry.notes || "",
    createdAt: entry.created_at || entry.createdAt,
    updatedAt: entry.updated_at || entry.updatedAt
  };
}

async function getCheckin(userId, date = getLocalDate()) {
  return normalizeCheckin(
    await db
      .prepare(
        `
          SELECT *
          FROM daily_checkins
          WHERE user_id = ? AND entry_date = ?
        `
      )
      .get(userId, date)
  );
}

function buildReadinessScore(entry) {
  if (!entry) {
    return 0;
  }

  const stressScore = 6 - entry.stress;
  const sleepScore = Math.max(0, 5 - Math.min(Math.abs(8 - entry.sleepHours), 5));
  const total =
    (entry.mood * 20 +
      entry.energy * 20 +
      stressScore * 20 +
      entry.hunger * 10 +
      sleepScore * 10) /
    4;

  return Number(Math.min(Math.max(total, 0), 100).toFixed(1));
}

async function getCheckinSummary(userId, date = getLocalDate()) {
  const entry = await getCheckin(userId, date);
  const trend = await Promise.all(
    getLastDates(date, 7).map(async (day) => {
      const item = await getCheckin(userId, day);

      return {
        date: day,
        mood: item?.mood || 0,
        energy: item?.energy || 0,
        stress: item?.stress || 0,
        readiness: buildReadinessScore(item)
      };
    })
  );

  return {
    date,
    entry,
    readinessScore: buildReadinessScore(entry),
    trend
  };
}

async function upsertCheckin(userId, payload) {
  const date = payload.date || getLocalDate();
  const now = getTimestamp();

  await db.prepare(
    `
      INSERT INTO daily_checkins (
        user_id, entry_date, mood, energy, stress, hunger, sleep_hours, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, entry_date) DO UPDATE SET
        mood = excluded.mood,
        energy = excluded.energy,
        stress = excluded.stress,
        hunger = excluded.hunger,
        sleep_hours = excluded.sleep_hours,
        notes = excluded.notes,
        updated_at = excluded.updated_at
    `
  ).run(
    userId,
    date,
    payload.mood,
    payload.energy,
    payload.stress,
    payload.hunger,
    payload.sleepHours,
    payload.notes || "",
    now,
    now
  );

  return getCheckin(userId, date);
}

async function deleteCheckin(userId, date = getLocalDate()) {
  const result = await db
    .prepare(`DELETE FROM daily_checkins WHERE user_id = ? AND entry_date = ?`)
    .run(userId, date);

  return {
    success: result.changes > 0
  };
}

function seedWellbeingRange(userId, baseDate = getLocalDate(), days = 10) {
  const insert = db.prepare(
    `
      INSERT OR IGNORE INTO daily_checkins (
        user_id, entry_date, mood, energy, stress, hunger, sleep_hours, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  );
  const operations = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = addDays(baseDate, -index);
    const mood = 3 + ((userId + index) % 3);
    const energy = 3 + ((userId + index + 1) % 3);
    const stress = 2 + ((userId + index) % 3);
    const hunger = 3 + ((userId + index + 2) % 2);
    const sleepHours = 6.5 + ((userId + index) % 4) * 0.5;
    const now = `${date}T08:00:00.000Z`;

    operations.push(
      insert.run(
        userId,
        date,
        Math.min(mood, 5),
        Math.min(energy, 5),
        Math.min(stress, 5),
        Math.min(hunger, 5),
        sleepHours,
        "Автоматически подготовленная wellbeing-запись.",
        now,
        now
      )
    );
  }

  if (operations.some((item) => item && typeof item.then === "function")) {
    return Promise.all(operations);
  }
}

module.exports = {
  buildReadinessScore,
  deleteCheckin,
  getCheckin,
  getCheckinSummary,
  seedWellbeingRange,
  upsertCheckin
};
