const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { assertNumber } = require("../../lib/validation");
const { getGoals, updateGoals } = require("./goals.service");

const router = express.Router();

router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(getGoals(req.user.id));
});

router.put("/", (req, res) => {
  const { calories, protein, fat, carbs } = req.body;

  assertNumber(calories, "calories");
  assertNumber(protein, "protein");
  assertNumber(fat, "fat");
  assertNumber(carbs, "carbs");

  res.json(
    updateGoals(req.user.id, {
      calories,
      protein,
      fat,
      carbs
    })
  );
});

module.exports = router;
