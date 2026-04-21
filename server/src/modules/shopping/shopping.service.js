const { db } = require("../../db/connection");
const { getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");

function normalizeItem(item) {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    plannedFor: item.planned_for || item.plannedFor || null,
    source: item.source || "",
    notes: item.notes || "",
    checked: Boolean(item.is_checked ?? item.checked),
    createdAt: item.created_at || item.createdAt,
    updatedAt: item.updated_at || item.updatedAt
  };
}

function listShoppingItems(userId, { checked } = {}) {
  const conditions = ["user_id = ?"];
  const parameters = [userId];

  if (checked === true || checked === false) {
    conditions.push("is_checked = ?");
    parameters.push(checked ? 1 : 0);
  }

  const items = db
    .prepare(
      `
        SELECT *
        FROM shopping_items
        WHERE ${conditions.join(" AND ")}
        ORDER BY is_checked ASC, created_at DESC, id DESC
      `
    )
    .all(...parameters)
    .map(normalizeItem);

  const checkedCount = items.filter((item) => item.checked).length;

  return {
    items,
    summary: {
      total: items.length,
      checked: checkedCount,
      pending: items.length - checkedCount
    }
  };
}

function getShoppingItemById(userId, itemId) {
  const item = db
    .prepare(`SELECT * FROM shopping_items WHERE user_id = ? AND id = ?`)
    .get(userId, itemId);

  if (!item) {
    throw createHttpError(404, "Shopping item not found");
  }

  return normalizeItem(item);
}

function createShoppingItem(userId, payload) {
  const now = getTimestamp();
  const result = db
    .prepare(
      `
        INSERT INTO shopping_items (
          user_id, title, category, quantity, unit, planned_for, source, notes, is_checked, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `
    )
    .run(
      userId,
      payload.title,
      payload.category,
      payload.quantity ?? 1,
      payload.unit || "шт",
      payload.plannedFor || null,
      payload.source || "manual",
      payload.notes || "",
      now,
      now
    );

  return getShoppingItemById(userId, result.lastInsertRowid);
}

function createShoppingItemFromProduct(userId, productId, overrides = {}) {
  const product = db
    .prepare(`SELECT id, name, category FROM products WHERE id = ?`)
    .get(productId);

  if (!product) {
    throw createHttpError(404, "Product not found");
  }

  return createShoppingItem(userId, {
    title: overrides.title || product.name,
    category: overrides.category || product.category,
    quantity: overrides.quantity ?? 1,
    unit: overrides.unit || "шт",
    plannedFor: overrides.plannedFor,
    source: "product-catalog",
    notes: overrides.notes || `Добавлено из каталога: ${product.name}`
  });
}

function setShoppingItemChecked(userId, itemId, checked) {
  getShoppingItemById(userId, itemId);

  db.prepare(
    `
      UPDATE shopping_items
      SET is_checked = ?, updated_at = ?
      WHERE user_id = ? AND id = ?
    `
  ).run(checked ? 1 : 0, getTimestamp(), userId, itemId);

  return getShoppingItemById(userId, itemId);
}

function deleteShoppingItem(userId, itemId) {
  const result = db
    .prepare(`DELETE FROM shopping_items WHERE user_id = ? AND id = ?`)
    .run(userId, itemId);

  if (result.changes === 0) {
    throw createHttpError(404, "Shopping item not found");
  }

  return { success: true };
}

function clearCheckedShoppingItems(userId) {
  const result = db
    .prepare(`DELETE FROM shopping_items WHERE user_id = ? AND is_checked = 1`)
    .run(userId);

  return {
    success: true,
    removed: result.changes
  };
}

module.exports = {
  clearCheckedShoppingItems,
  createShoppingItem,
  createShoppingItemFromProduct,
  deleteShoppingItem,
  listShoppingItems,
  setShoppingItemChecked
};
