const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const {
  assertDate,
  assertMealType,
  assertNonEmptyString,
  assertNumber,
  assertTime
} = require("../../lib/validation");
const {
  applyTemplate,
  createTemplate,
  createTemplateFromMeal,
  deleteTemplate,
  listTemplates
} = require("./templates.service");

const router = express.Router();

function validateTemplatePayload(payload) {
  assertNonEmptyString(payload.name, "name");
  assertMealType(payload.mealType);
  assertNumber(payload.grams, "grams");
  assertNumber(payload.calories, "calories");
  assertNumber(payload.protein, "protein");
  assertNumber(payload.fat, "fat");
  assertNumber(payload.carbs, "carbs");
}

router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(listTemplates(req.user.id));
});

router.post("/", (req, res) => {
  validateTemplatePayload(req.body);
  res.status(201).json(createTemplate(req.user.id, req.body));
});

router.post("/from-meal/:mealId", (req, res) => {
  if (req.body.name) {
    assertNonEmptyString(req.body.name, "name");
  }

  res
    .status(201)
    .json(createTemplateFromMeal(req.user.id, Number(req.params.mealId), req.body.name));
});

router.post("/:id/apply", (req, res) => {
  if (req.body.date) {
    assertDate(req.body.date);
  }

  if (req.body.eatenAt) {
    assertTime(req.body.eatenAt);
  }

  if (req.body.title) {
    assertNonEmptyString(req.body.title, "title");
  }

  if (req.body.mealType) {
    assertMealType(req.body.mealType);
  }

  res.status(201).json(applyTemplate(req.user.id, Number(req.params.id), req.body));
});

router.delete("/:id", (req, res) => {
  res.json(deleteTemplate(req.user.id, Number(req.params.id)));
});

module.exports = router;
