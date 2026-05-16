const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { assertDate } = require("../../lib/validation");
const { getDashboard } = require("./dashboard.service");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const requestedDate = req.query.date;

  if (requestedDate) {
    assertDate(requestedDate);
  }

  res.json(await getDashboard(req.user, requestedDate || undefined));
});

module.exports = router;
