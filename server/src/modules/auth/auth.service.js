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

async function findUserByEmail(email) {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
}

async function createGoalsForUser(userId) {
  await db.prepare(`
    INSERT INTO goals (user_id, calories, protein, fat, carbs, updated_at)
    VALUES (?, 2200, 140, 70, 240, ?)
  `).run(userId, getTimestamp());
}

async function registerUser({ name, email, password }) {
  if (await findUserByEmail(email)) {
    throw createHttpError(409, "User with this email already exists");
  }

  const createdAt = getTimestamp();
  const result = await db
    .prepare(`
      INSERT INTO users (name, email, password_hash, role, created_at)
      VALUES (?, ?, ?, 'user', ?)
    `)
    .run(name.trim(), email.trim().toLowerCase(), hashPassword(password), createdAt);

  await createGoalsForUser(result.lastInsertRowid);

  const user = await db
    .prepare(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`)
    .get(result.lastInsertRowid);

  return {
    token: signAccessToken(sanitizeUser(user)),
    user: sanitizeUser(user)
  };
}

async function loginUser({ email, password }) {
  const user = await findUserByEmail(email.trim().toLowerCase());

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
