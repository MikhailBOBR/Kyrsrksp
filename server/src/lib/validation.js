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

function assertInRange(value, fieldName, min, max) {
  if (typeof value !== "number" || Number.isNaN(value) || value < min || value > max) {
    throw createHttpError(400, `Field "${fieldName}" must be between ${min} and ${max}`);
  }
}

function assertOneOf(value, fieldName, allowedValues) {
  assertNonEmptyString(value, fieldName);

  if (!allowedValues.includes(value.trim())) {
    throw createHttpError(
      400,
      `Field "${fieldName}" must be one of: ${allowedValues.join(", ")}`
    );
  }
}

function assertDate(value, fieldName = "date") {
  assertNonEmptyString(value, fieldName);

  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw createHttpError(400, `Field "${fieldName}" must match YYYY-MM-DD`);
  }

  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw createHttpError(400, `Field "${fieldName}" must be a valid calendar date`);
  }
}

function assertTime(value, fieldName = "eatenAt") {
  assertNonEmptyString(value, fieldName);

  const normalized = value.trim();

  if (!/^\d{2}:\d{2}$/.test(normalized)) {
    throw createHttpError(400, `Field "${fieldName}" must match HH:MM`);
  }

  const [hours, minutes] = normalized.split(":").map(Number);

  if (hours > 23 || minutes > 59) {
    throw createHttpError(400, `Field "${fieldName}" must be a valid time`);
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
  assertInRange,
  assertMealType,
  assertNonEmptyString,
  assertNumber,
  assertOneOf,
  assertPassword,
  assertProductCategory,
  assertTime,
  mealTypes,
  productCategories
};
