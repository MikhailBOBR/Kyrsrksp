const express = require("express");
const { assertEmail, assertNonEmptyString, assertPassword } = require("../../lib/validation");
const { loginUser, registerUser } = require("./auth.service");
const { requireAuth } = require("../../middlewares/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  assertNonEmptyString(name, "name");
  assertEmail(email);
  assertPassword(password);

  const payload = await registerUser({
    name,
    email,
    password
  });

  res.status(201).json(payload);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  assertEmail(email);
  assertPassword(password);

  res.json(await loginUser({ email, password }));
});

router.get("/me", requireAuth, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;
