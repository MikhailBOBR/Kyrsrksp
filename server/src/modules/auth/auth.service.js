const { db } = require("../../db/connection");
const { getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");
const { hashPassword, signAccessToken, verifyPassword } = require("../../lib/security");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at || user.createdAt
  };
}

function findUserByEmail(email) {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
}

function createGoalsForUser(userId) {
  db.prepare(`
    INSERT INTO goals (user_id, calories, protein, fat, carbs, updated_at)
    VALUES (?, 2200, 140, 70, 240, ?)
  `).run(userId, getTimestamp());
}

function registerUser({ name, email, password }) {
  if (findUserByEmail(email)) {
    throw createHttpError(409, "User with this email already exists");
  }

  const createdAt = getTimestamp();
  const result = db
    .prepare(`
      INSERT INTO users (name, email, password_hash, role, created_at)
      VALUES (?, ?, ?, 'user', ?)
    `)
    .run(name.trim(), email.trim().toLowerCase(), hashPassword(password), createdAt);

  createGoalsForUser(result.lastInsertRowid);

  const user = db
    .prepare(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`)
    .get(result.lastInsertRowid);

  return {
    token: signAccessToken(sanitizeUser(user)),
    user: sanitizeUser(user)
  };
}

function loginUser({ email, password }) {
  const user = findUserByEmail(email.trim().toLowerCase());

  if (!user || !verifyPassword(password, user.password_hash)) {
    throw createHttpError(401, "Invalid email or password");
  }

  return {
    token: signAccessToken(sanitizeUser(user)),
    user: sanitizeUser(user)
  };
}

module.exports = {
  loginUser,
  registerUser
};
