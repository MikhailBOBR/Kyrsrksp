const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { assertDate, assertNonEmptyString, assertNumber } = require("../../lib/validation");
const {
  createBodyMetric,
  deleteBodyMetric,
  getBodyMetricsSummary
} = require("./metrics.service");

const router = express.Router();

function validateMetricPayload(payload) {
  assertNumber(payload.weightKg, "weightKg");

  if (payload.date) {
    assertDate(payload.date);
  }

  if (payload.bodyFat !== undefined && payload.bodyFat !== null) {
    assertNumber(payload.bodyFat, "bodyFat");
  }

  if (payload.waistCm !== undefined && payload.waistCm !== null) {
    assertNumber(payload.waistCm, "waistCm");
  }

  if (payload.chestCm !== undefined && payload.chestCm !== null) {
    assertNumber(payload.chestCm, "chestCm");
  }

  if (payload.notes !== undefined && payload.notes !== null && payload.notes !== "") {
    assertNonEmptyString(payload.notes, "notes");
  }
}

router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(getBodyMetricsSummary(req.user.id));
});

router.post("/", (req, res) => {
  validateMetricPayload(req.body);
  res.status(201).json(createBodyMetric(req.user.id, req.body));
});

router.delete("/:id", (req, res) => {
  res.json(deleteBodyMetric(req.user.id, Number(req.params.id)));
});

module.exports = router;
