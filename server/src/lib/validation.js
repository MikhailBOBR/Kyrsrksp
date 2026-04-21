const { createHttpError } = require("./http");

const mealTypes = ["Завтрак", "Обед", "Ужин", "Перекус"];
const productCategories = [
  "Белковые продукты",
  "Крупы и гарниры",
  "Овощи",
  "Фрукты",
  "Напитки",
  "Десерты",
  "Прочее"
];

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw createHttpError(400, `Field "${fieldName}" must be a non-empty string`);
  }
}

function assertEmail(value, fieldName = "email") {
  assertNonEmptyString(value, fieldName);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    throw createHttpError(400, `Field "${fieldName}" must be a valid email`);
  }
}

function assertPassword(value) {
  assertNonEmptyString(value, "password");

  if (value.trim().length < 8) {
    throw createHttpError(400, 'Field "password" must contain at least 8 characters');
  }
}

function assertNumber(value, fieldName) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw createHttpError(400, `Field "${fieldName}" must be a non-negative number`);
  }
}

function assertDate(value, fieldName = "date") {
  assertNonEmptyString(value, fieldName);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    throw createHttpError(400, `Field "${fieldName}" must match YYYY-MM-DD`);
  }
}

function assertTime(value, fieldName = "eatenAt") {
  assertNonEmptyString(value, fieldName);

  if (!/^\d{2}:\d{2}$/.test(value.trim())) {
    throw createHttpError(400, `Field "${fieldName}" must match HH:MM`);
  }
}

function assertMealType(value) {
  assertNonEmptyString(value, "mealType");

  if (!mealTypes.includes(value.trim())) {
    throw createHttpError(400, `Field "mealType" must be one of: ${mealTypes.join(", ")}`);
  }
}

function assertProductCategory(value) {
  assertNonEmptyString(value, "category");

  if (!productCategories.includes(value.trim())) {
    throw createHttpError(
      400,
      `Field "category" must be one of: ${productCategories.join(", ")}`
    );
  }
}

module.exports = {
  assertDate,
  assertEmail,
  assertMealType,
  assertNonEmptyString,
  assertNumber,
  assertPassword,
  assertProductCategory,
  assertTime,
  mealTypes,
  productCategories
};
