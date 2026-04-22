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

router.get("/", (req, res) => {
  if (req.query.date) {
    assertDate(req.query.date);
  }

  res.json(getDayNote(req.user.id, req.query.date));
});

router.get("/recent", (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  res.json(listRecentDayNotes(req.user.id, Number.isNaN(limit) ? 5 : limit));
});

router.put("/", (req, res) => {
  if (req.body.date) {
    assertDate(req.body.date);
  }

  ["title", "focus", "wins", "improvements", "notes"].forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== "") {
      assertNonEmptyString(req.body[field], field);
    }
  });

  res.json(upsertDayNote(req.user.id, req.body));
});

router.delete("/", (req, res) => {
  if (req.query.date) {
    assertDate(req.query.date);
  }

  res.json(deleteDayNote(req.user.id, req.query.date));
});

module.exports = router;
