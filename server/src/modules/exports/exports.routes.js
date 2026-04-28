const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { createHttpError } = require("../../lib/http");
const { assertDate } = require("../../lib/validation");
const { buildReport } = require("./exports.service");

const router = express.Router();

router.get("/daily-report", requireAuth, async (req, res) => {
  const format = String(req.query.format || "json").toLowerCase();
  const date = req.query.date;

  if (date) {
    assertDate(date);
  }

  if (format !== "json") {
    throw createHttpError(400, "Export format is not supported");
  }

  res.json(await buildReport(req.user, date));
});

module.exports = router;
