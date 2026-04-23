const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { assertDate, assertNumber, assertTime } = require("../../lib/validation");
const {
  addHydrationEntry,
  deleteHydrationEntry,
  getHydrationSummary
} = require("./hydration.service");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const date = req.query.date;

  if (date) {
    assertDate(date);
  }

  res.json(await getHydrationSummary(req.user.id, date));
});

router.post("/", async (req, res) => {
  const { amountMl, loggedAt, date } = req.body;

  assertNumber(amountMl, "amountMl");
  assertTime(loggedAt || "00:00", "loggedAt");

  if (date) {
    assertDate(date);
  }

  res.status(201).json(await addHydrationEntry(req.user.id, amountMl, loggedAt, date));
});

router.delete("/:id", async (req, res) => {
  res.json(await deleteHydrationEntry(req.user.id, Number(req.params.id)));
});

module.exports = router;
