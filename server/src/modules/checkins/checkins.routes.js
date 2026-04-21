const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { assertDate, assertInRange, assertNonEmptyString } = require("../../lib/validation");
const { deleteCheckin, getCheckinSummary, upsertCheckin } = require("./checkins.service");

const router = express.Router();

function validateCheckinPayload(payload) {
  assertInRange(payload.mood, "mood", 1, 5);
  assertInRange(payload.energy, "energy", 1, 5);
  assertInRange(payload.stress, "stress", 1, 5);
  assertInRange(payload.hunger, "hunger", 1, 5);
  assertInRange(payload.sleepHours, "sleepHours", 0, 24);

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

  res.json(getCheckinSummary(req.user.id, req.query.date));
});

router.put("/", (req, res) => {
  validateCheckinPayload(req.body);
  res.json(upsertCheckin(req.user.id, req.body));
});

router.delete("/", (req, res) => {
  if (req.query.date) {
    assertDate(req.query.date);
  }

  res.json(deleteCheckin(req.user.id, req.query.date));
});

module.exports = router;
