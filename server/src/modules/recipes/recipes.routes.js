const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { createHttpError } = require("../../lib/http");
const {
  assertDate,
  assertMealType,
  assertNonEmptyString,
  assertNumber,
  assertTime
} = require("../../lib/validation");
const {
  applyRecipe,
  createPlanFromRecipe,
  createRecipe,
  deleteRecipe,
  listRecipes
} = require("./recipes.service");

const router = express.Router();

function validateIngredients(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw createHttpError(400, 'Field "ingredients" must contain at least one ingredient');
  }

  ingredients.forEach((item, index) => {
    assertNumber(Number(item.productId), `ingredients[${index}].productId`);
    assertNumber(Number(item.grams), `ingredients[${index}].grams`);
  });
}

function validateRecipePayload(payload) {
  assertNonEmptyString(payload.title, "title");
  assertMealType(payload.mealType);
  validateIngredients(payload.ingredients);

  if (payload.notes) {
    assertNonEmptyString(payload.notes, "notes");
  }

  if (payload.instructions) {
    assertNonEmptyString(payload.instructions, "instructions");
  }
}

function validateRecipeActionPayload(payload, timeField) {
  if (payload.date) {
    assertDate(payload.date);
  }

  if (payload[timeField]) {
    assertTime(payload[timeField], timeField);
  }

  if (payload.title) {
    assertNonEmptyString(payload.title, "title");
  }

  if (payload.mealType) {
    assertMealType(payload.mealType);
  }

  if (payload.multiplier !== undefined) {
    assertNumber(Number(payload.multiplier), "multiplier");
  }
}

router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(listRecipes(req.user.id));
});

router.post("/", (req, res, next) => {
  try {
    validateRecipePayload(req.body);
    res.status(201).json(createRecipe(req.user.id, req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/apply", (req, res) => {
  validateRecipeActionPayload(req.body, "eatenAt");
  res.status(201).json(applyRecipe(req.user.id, Number(req.params.id), req.body));
});

router.post("/:id/plan", (req, res) => {
  validateRecipeActionPayload(req.body, "plannedTime");
  res.status(201).json(createPlanFromRecipe(req.user.id, Number(req.params.id), req.body));
});

router.delete("/:id", (req, res) => {
  res.json(deleteRecipe(req.user.id, Number(req.params.id)));
});

module.exports = router;
