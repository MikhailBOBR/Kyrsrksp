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
  createPlan,
  createPlanFromTemplate,
  deletePlan,
  generateWeeklyPlan,
  getPlannerSummary,
  listPlans,
  setPlanCompletion
} = require("./planner.service");

const router = express.Router();

function validatePlanPayload(payload) {
  assertNonEmptyString(payload.title, "title");
  assertMealType(payload.mealType);
  assertTime(payload.plannedTime, "plannedTime");
  assertNumber(payload.targetCalories, "targetCalories");
  assertNumber(payload.targetProtein, "targetProtein");
  assertNumber(payload.targetFat, "targetFat");
  assertNumber(payload.targetCarbs, "targetCarbs");

  if (payload.date) {
    assertDate(payload.date);
  }
}

router.use(requireAuth);

router.get("/", (req, res) => {
  if (req.query.date) {
    assertDate(req.query.date);
    res.json(getPlannerSummary(req.user.id, req.query.date));
    return;
  }

  if (req.query.dateFrom) {
    assertDate(req.query.dateFrom);
  }

  if (req.query.dateTo) {
    assertDate(req.query.dateTo);
  }

  res.json(
    listPlans(req.user.id, {
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    })
  );
});

router.post("/", (req, res) => {
  validatePlanPayload(req.body);
  res.status(201).json(createPlan(req.user.id, req.body));
});

router.post("/from-template/:templateId", (req, res) => {
  if (req.body.date) {
    assertDate(req.body.date);
  }

  if (req.body.plannedTime) {
    assertTime(req.body.plannedTime, "plannedTime");
  }

  if (req.body.title) {
    assertNonEmptyString(req.body.title, "title");
  }

  if (req.body.mealType) {
    assertMealType(req.body.mealType);
  }

  res
    .status(201)
    .json(createPlanFromTemplate(req.user.id, Number(req.params.templateId), req.body));
});

router.post("/generate-week", (req, res) => {
  if (req.body.startDate) {
    assertDate(req.body.startDate, "startDate");
  }

  if (req.body.days !== undefined) {
    assertNumber(Number(req.body.days), "days");
  }

  res.status(201).json(
    generateWeeklyPlan(req.user.id, {
      startDate: req.body.startDate,
      days: req.body.days,
      includeSnack: req.body.includeSnack !== false,
      replaceExisting: req.body.replaceExisting !== false
    })
  );
});

router.patch("/:id/completion", (req, res) => {
  res.json(setPlanCompletion(req.user.id, Number(req.params.id), Boolean(req.body.completed)));
});

router.delete("/:id", (req, res) => {
  res.json(deletePlan(req.user.id, Number(req.params.id)));
});

module.exports = router;
