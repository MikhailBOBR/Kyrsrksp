const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { assertDate, assertNonEmptyString } = require("../../lib/validation");
const {
  deleteDayNote,
  getDayNote,
  listRecentDayNotes,
  upsertDayNote
} = require("./day-notes.service");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  if (req.query.date) {
    assertDate(req.query.date);
  }

  res.json(await getDayNote(req.user.id, req.query.date));
});

router.get("/recent", async (req, res) => {
  const requestedLimit = req.query.limit ? Number(req.query.limit) : 5;
  const safeLimit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.trunc(requestedLimit), 30)
      : 5;

  res.json(await listRecentDayNotes(req.user.id, safeLimit));
});

router.put("/", async (req, res) => {
  if (req.body.date) {
    assertDate(req.body.date);
  }

  ["title", "focus", "wins", "improvements", "notes"].forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== "") {
      assertNonEmptyString(req.body[field], field);
    }
  });

  res.json(await upsertDayNote(req.user.id, req.body));
});

router.delete("/", async (req, res) => {
  if (req.query.date) {
    assertDate(req.query.date);
  }

  res.json(await deleteDayNote(req.user.id, req.query.date));
});

module.exports = router;
