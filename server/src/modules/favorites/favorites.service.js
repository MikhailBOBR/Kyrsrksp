const { db } = require("../../db/connection");
const { getTimestamp } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");
const { getProductById } = require("../products/products.service");
const { getTemplateById } = require("../templates/templates.service");

async function listFavoriteProducts(userId) {
  return db
    .prepare(
      `
        SELECT
          p.id,
          p.name,
          p.brand,
          p.category,
          p.calories,
          p.protein,
          p.fat,
          p.carbs,
          fp.created_at AS favoritedAt
        FROM favorite_products fp
        INNER JOIN products p ON p.id = fp.product_id
        WHERE fp.user_id = ?
        ORDER BY fp.created_at DESC, p.name ASC
      `
    )
    .all(userId);
}

async function listFavoriteTemplates(userId) {
  return db
    .prepare(
      `
        SELECT
          mt.id,
          mt.name,
          mt.meal_type AS mealType,
          mt.grams,
          mt.calories,
          mt.protein,
          mt.fat,
          mt.carbs,
          mt.notes,
          mt.usage_count AS usageCount,
          ft.created_at AS favoritedAt
        FROM favorite_templates ft
        INNER JOIN meal_templates mt ON mt.id = ft.template_id
        WHERE ft.user_id = ?
        ORDER BY ft.created_at DESC, mt.updated_at DESC
      `
    )
    .all(userId);
}

async function listFavorites(userId) {
  const [products, templates] = await Promise.all([
    listFavoriteProducts(userId),
    listFavoriteTemplates(userId)
  ]);

  return {
    products,
    templates,
    total: products.length + templates.length
  };
}

async function addFavoriteProduct(userId, productId) {
  await getProductById(productId);

  await db.prepare(
    `
      INSERT OR IGNORE INTO favorite_products (user_id, product_id, created_at)
      VALUES (?, ?, ?)
    `
  ).run(userId, productId, getTimestamp());

  return listFavorites(userId);
}

async function removeFavoriteProduct(userId, productId) {
  const result = await db
    .prepare(`DELETE FROM favorite_products WHERE user_id = ? AND product_id = ?`)
    .run(userId, productId);

  if (result.changes === 0) {
    throw createHttpError(404, "Favorite product not found");
  }

  return listFavorites(userId);
}

async function addFavoriteTemplate(userId, templateId) {
  await getTemplateById(userId, templateId);

  await db.prepare(
    `
      INSERT OR IGNORE INTO favorite_templates (user_id, template_id, created_at)
      VALUES (?, ?, ?)
    `
  ).run(userId, templateId, getTimestamp());

  return listFavorites(userId);
}

async function removeFavoriteTemplate(userId, templateId) {
  const result = await db
    .prepare(`DELETE FROM favorite_templates WHERE user_id = ? AND template_id = ?`)
    .run(userId, templateId);

  if (result.changes === 0) {
    throw createHttpError(404, "Favorite template not found");
  }

  return listFavorites(userId);
}

module.exports = {
  addFavoriteProduct,
  addFavoriteTemplate,
  listFavoriteProducts,
  listFavoriteTemplates,
  listFavorites,
  removeFavoriteProduct,
  removeFavoriteTemplate
};
