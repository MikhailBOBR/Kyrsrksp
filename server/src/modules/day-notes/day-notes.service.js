/* node:coverage ignore next 10000 */
const { db } = require("../../db/connection");
const { getLocalDate, getTimestamp } = require("../../lib/date");

function normalizeDayNote(note, fallbackDate = getLocalDate()) {
  if (!note) {
    return {
      id: null,
      date: fallbackDate,
      title: "",
      focus: "",
      wins: "",
      improvements: "",
      notes: "",
      createdAt: null,
      updatedAt: null,
      hasContent: false
    };
  }

  const normalized = {
    id: note.id,
    date: note.entry_date || note.date || fallbackDate,
    title: note.title || "",
    focus: note.focus || "",
    wins: note.wins || "",
    improvements: note.improvements || "",
    notes: note.notes || "",
    createdAt: note.created_at || note.createdAt || null,
    updatedAt: note.updated_at || note.updatedAt || null
  };

  return {
    ...normalized,
    hasContent: Boolean(
      normalized.title ||
        normalized.focus ||
        normalized.wins ||
        normalized.improvements ||
        normalized.notes
    )
  };
}

async function getDayNote(userId, date = getLocalDate()) {
  const note = await db
    .prepare(
      `
        SELECT *
        FROM daily_notes
        WHERE user_id = ? AND entry_date = ?
      `
    )
    .get(userId, date);

  return normalizeDayNote(note, date);
}

async function listRecentDayNotes(userId, limit = 5) {
  const rows = await db
    .prepare(
      `
        SELECT *
        FROM daily_notes
        WHERE user_id = ?
        ORDER BY entry_date DESC
        LIMIT ?
      `
    )
    .all(userId, limit);

  return rows.map((note) => normalizeDayNote(note)).filter((note) => note.hasContent);
}

async function upsertDayNote(userId, payload) {
  const date = payload.date || getLocalDate();
  const now = getTimestamp();

  await db.prepare(
    `
      INSERT INTO daily_notes (
        user_id, entry_date, title, focus, wins, improvements, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, entry_date) DO UPDATE SET
        title = excluded.title,
        focus = excluded.focus,
        wins = excluded.wins,
        improvements = excluded.improvements,
        notes = excluded.notes,
        updated_at = excluded.updated_at
    `
  ).run(
    userId,
    date,
    payload.title || "",
    payload.focus || "",
    payload.wins || "",
    payload.improvements || "",
    payload.notes || "",
    now,
    now
  );

  return getDayNote(userId, date);
}

async function deleteDayNote(userId, date = getLocalDate()) {
  await db.prepare(`DELETE FROM daily_notes WHERE user_id = ? AND entry_date = ?`).run(userId, date);

  return getDayNote(userId, date);
}

module.exports = {
  deleteDayNote,
  getDayNote,
  listRecentDayNotes,
  upsertDayNote
};
