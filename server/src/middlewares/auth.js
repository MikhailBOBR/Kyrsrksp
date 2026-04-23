const { db } = require("../db/connection");
const { createHttpError } = require("../lib/http");
const { verifyAccessToken } = require("../lib/security");

async function requireAuth(req, _res, next) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    next(createHttpError(401, "Authorization token is required"));
    return;
  }

  try {
    const payload = verifyAccessToken(authorization.replace("Bearer ", ""));
    const user = await db
      .prepare(`
        SELECT id, name, email, role, created_at AS createdAt
        FROM users
        WHERE id = ?
      `)
      .get(Number(payload.sub));

    if (!user) {
      throw createHttpError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    next(createHttpError(401, "Invalid or expired authorization token"));
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(createHttpError(401, "Authentication is required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(createHttpError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
