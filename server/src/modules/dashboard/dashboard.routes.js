const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { getDashboard } = require("./dashboard.service");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  res.json(getDashboard(req.user));
});

module.exports = router;
