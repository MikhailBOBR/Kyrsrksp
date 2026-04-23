const { db } = require("./connection");
const { getTimestamp } = require("../lib/date");
const { hashPassword } = require("../lib/security");

function sanitizeAdminUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at || user.createdAt
  };
}

function ensureGoals(userId) {
  db.prepare(`
    INSERT OR IGNORE INTO goals (user_id, calories, protein, fat, carbs, updated_at)
    VALUES (?, 2200, 140, 70, 240, ?)
  `).run(userId, getTimestamp());
}

function ensureAdminUser({ email, password, name }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();
  const now = getTimestamp();
  const existing = db.prepare(`SELECT * FROM users WHERE email = ?`).get(normalizedEmail);

  if (existing) {
    db.prepare(`
      UPDATE users
      SET name = ?, password_hash = ?, role = 'admin'
      WHERE id = ?
    `).run(normalizedName, hashPassword(password), existing.id);

    ensureGoals(existing.id);

    return {
      created: false,
      user: sanitizeAdminUser(
        db.prepare(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`).get(existing.id)
      )
    };
  }

  const result = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, created_at)
    VALUES (?, ?, ?, 'admin', ?)
  `).run(normalizedName, normalizedEmail, hashPassword(password), now);

  ensureGoals(result.lastInsertRowid);

  return {
    created: true,
    user: sanitizeAdminUser(
      db
        .prepare(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`)
        .get(result.lastInsertRowid)
    )
  };
}

module.exports = {
  ensureAdminUser
};
