const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { assertDate } = require("../../lib/validation");
const { buildCsvReport, buildReport } = require("./exports.service");

const router = express.Router();

router.get("/daily-report", requireAuth, async (req, res) => {
  const format = req.query.format || "json";
  const date = req.query.date;

  if (date) {
    assertDate(date);
  }

  const report = await buildReport(req.user, date);

  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="nutrition-report-${report.date}.csv"`
    );
    res.send(buildCsvReport(report));
    return;
  }

  res.json(report);
});

module.exports = router;
