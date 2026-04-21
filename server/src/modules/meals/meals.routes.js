const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const {
  assertDate,
  assertMealType,
  assertNonEmptyString,
  assertNumber,
  assertTime
} = require("../../lib/validation");
const { createMeal, deleteMeal, listMeals, updateMeal } = require("./meals.service");

const router = express.Router();

function validateMealPayload(payload) {
  assertNonEmptyString(payload.title, "title");
  assertMealType(payload.mealType);
  assertTime(payload.eatenAt);
  assertNumber(payload.grams, "grams");
  assertNumber(payload.calories, "calories");
  assertNumber(payload.protein, "protein");
  assertNumber(payload.fat, "fat");
  assertNumber(payload.carbs, "carbs");

  if (payload.date) {
    assertDate(payload.date);
  }

  if (payload.notes !== undefined && payload.notes !== null && payload.notes !== "") {
    assertNonEmptyString(payload.notes, "notes");
  }
}

router.use(requireAuth);

router.get("/", (req, res) => {
  if (req.query.date) {
    assertDate(req.query.date);
  }

  if (req.query.mealType) {
    assertMealType(req.query.mealType);
  }

  res.json(
    listMeals(req.user.id, {
      date: req.query.date,
      mealType: req.query.mealType
    })
  );
});

router.post("/", (req, res) => {
  validateMealPayload(req.body);
  res.status(201).json(createMeal(req.user.id, req.body));
});

router.put("/:id", (req, res) => {
  validateMealPayload(req.body);
  res.json(updateMeal(req.user.id, Number(req.params.id), req.body));
});

router.delete("/:id", (req, res) => {
  res.json(deleteMeal(req.user.id, Number(req.params.id)));
});

module.exports = router;
