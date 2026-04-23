const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { assertDate } = require("../../lib/validation");
const { getDashboard } = require("./dashboard.service");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  if (req.query.date) {
    assertDate(req.query.date);
  }

  res.json(await getDashboard(req.user, req.query.date));
});

module.exports = router;
