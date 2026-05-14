const { db } = require("../../db/connection");
const { createHttpError } = require("../../lib/http");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at
  };
}

function assertUserId(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, "User id must be a positive integer");
  }
}

async function listUsers() {
  const users = await db
    .prepare(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY
        CASE role WHEN 'admin' THEN 0 ELSE 1 END,
        name COLLATE NOCASE ASC,
        email COLLATE NOCASE ASC
    `)
    .all();

  return users.map(sanitizeUser);
}

async function getUserById(id) {
  assertUserId(id);

  const user = await db
    .prepare(`
      SELECT id, name, email, role, created_at
      FROM users
      WHERE id = ?
    `)
    .get(id);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user;
}

async function updateUserRole(id, role, actorId) {
  const user = await getUserById(id);

  if (id === actorId && role !== "admin") {
    throw createHttpError(400, "Admin cannot remove their own admin role");
  }

  if (user.role === role) {
    return sanitizeUser(user);
  }

  await db
    .prepare(`
      UPDATE users
      SET role = ?
      WHERE id = ?
    `)
    .run(role, id);

  return sanitizeUser(await getUserById(id));
}

module.exports = {
  listUsers,
  updateUserRole
};
