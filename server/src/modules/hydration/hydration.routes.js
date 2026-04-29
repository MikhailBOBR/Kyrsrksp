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
  const safeLoggedAt = loggedAt || "00:00";
  const safeDate = date || undefined;

  assertNumber(amountMl, "amountMl");
  assertTime(safeLoggedAt, "loggedAt");

  if (safeDate) {
    assertDate(safeDate);
  }

  res.status(201).json(await addHydrationEntry(req.user.id, amountMl, safeLoggedAt, safeDate));
});

router.delete("/:id", async (req, res) => {
  res.json(await deleteHydrationEntry(req.user.id, Number(req.params.id)));
});

module.exports = router;
