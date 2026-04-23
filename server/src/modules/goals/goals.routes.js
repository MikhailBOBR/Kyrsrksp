const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { assertNumber } = require("../../lib/validation");
const { applyGoalPreset, getGoals, listGoalPresets, updateGoals } = require("./goals.service");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  res.json(await getGoals(req.user.id));
});

router.get("/presets", (_req, res) => {
  res.json(listGoalPresets());
});

router.post("/presets/:presetId/apply", async (req, res) => {
  res.json(await applyGoalPreset(req.user.id, req.params.presetId));
});

router.put("/", async (req, res) => {
  const { calories, protein, fat, carbs } = req.body;

  assertNumber(calories, "calories");
  assertNumber(protein, "protein");
  assertNumber(fat, "fat");
  assertNumber(carbs, "carbs");

  res.json(
    await updateGoals(req.user.id, {
      calories,
      protein,
      fat,
      carbs
    })
  );
});

module.exports = router;
