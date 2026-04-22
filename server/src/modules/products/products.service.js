const { db } = require("../../db/connection");
const { getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");

function listProducts({ search, category }) {
  const conditions = [];
  const parameters = [];

  if (search) {
    conditions.push(`(name LIKE ? OR COALESCE(brand, '') LIKE ?)`);
    parameters.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    conditions.push(`category = ?`);
    parameters.push(category);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  return db
    .prepare(`
      SELECT
        id,
        name,
        brand,
        category,
        calories,
        protein,
        fat,
        carbs,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM products
      ${whereClause}
      ORDER BY name ASC
    `)
    .all(...parameters);
}

function createProduct(payload, createdBy) {
  const now = getTimestamp();
  const result = db
    .prepare(`
      INSERT INTO products (
        name, brand, category, calories, protein, fat, carbs, created_by, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      payload.name,
      payload.brand || null,
      payload.category,
      payload.calories,
      payload.protein,
      payload.fat,
      payload.carbs,
      createdBy,
      now,
      now
    );

  return getProductById(result.lastInsertRowid);
}

function getProductById(id) {
  const product = db
    .prepare(`
      SELECT
        id,
        name,
        brand,
        category,
        calories,
        protein,
        fat,
        carbs,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM products
      WHERE id = ?
    `)
    .get(id);

  if (!product) {
    throw createHttpError(404, "Product not found");
  }

  return product;
}

function updateProduct(id, payload) {
  getProductById(id);

  db.prepare(`
    UPDATE products
    SET
      name = ?,
      brand = ?,
      category = ?,
      calories = ?,
      protein = ?,
      fat = ?,
      carbs = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    payload.name,
    payload.brand || null,
    payload.category,
    payload.calories,
    payload.protein,
    payload.fat,
    payload.carbs,
    getTimestamp(),
    id
  );

  return getProductById(id);
}

function deleteProduct(id) {
  const result = db.prepare(`DELETE FROM products WHERE id = ?`).run(id);

  if (result.changes === 0) {
    throw createHttpError(404, "Product not found");
  }

  return { success: true };
}

module.exports = {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct
};
