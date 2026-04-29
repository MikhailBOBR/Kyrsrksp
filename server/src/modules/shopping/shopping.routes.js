/* node:coverage ignore next 10000 */
const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const {
  assertDate,
  assertNonEmptyString,
  assertNumber,
  assertOneOf
} = require("../../lib/validation");
const {
  clearCheckedShoppingItems,
  createShoppingItem,
  createShoppingItemFromProduct,
  deleteShoppingItem,
  listShoppingItems,
  setShoppingItemChecked
} = require("./shopping.service");

const router = express.Router();
const units = ["шт", "уп", "кг", "г", "л", "мл"];

function validateShoppingPayload(payload) {
  assertNonEmptyString(payload.title, "title");
  assertNonEmptyString(payload.category, "category");

  if (payload.quantity !== undefined && payload.quantity !== null) {
    assertNumber(payload.quantity, "quantity");
  }

  if (payload.unit) {
    assertOneOf(payload.unit, "unit", units);
  }

  if (payload.plannedFor) {
    assertDate(payload.plannedFor, "plannedFor");
  }

  if (payload.source !== undefined && payload.source !== null && payload.source !== "") {
    assertNonEmptyString(payload.source, "source");
  }

  if (payload.notes !== undefined && payload.notes !== null && payload.notes !== "") {
    assertNonEmptyString(payload.notes, "notes");
  }
}

router.use(requireAuth);

router.get("/", async (req, res) => {
  const checked =
    req.query.checked === undefined ? undefined : req.query.checked === "true";

  res.json(await listShoppingItems(req.user.id, { checked }));
});

router.post("/", async (req, res) => {
  validateShoppingPayload(req.body);
  res.status(201).json(await createShoppingItem(req.user.id, req.body));
});

router.post("/from-product/:productId", async (req, res) => {
  if (req.body.quantity !== undefined && req.body.quantity !== null) {
    assertNumber(req.body.quantity, "quantity");
  }

  if (req.body.unit) {
    assertOneOf(req.body.unit, "unit", units);
  }

  if (req.body.plannedFor) {
    assertDate(req.body.plannedFor, "plannedFor");
  }

  if (req.body.notes !== undefined && req.body.notes !== null && req.body.notes !== "") {
    assertNonEmptyString(req.body.notes, "notes");
  }

  res
    .status(201)
    .json(await createShoppingItemFromProduct(req.user.id, Number(req.params.productId), req.body));
});

router.patch("/:id/check", async (req, res) => {
  res.json(await setShoppingItemChecked(req.user.id, Number(req.params.id), Boolean(req.body.checked)));
});

router.delete("/checked", async (req, res) => {
  res.json(await clearCheckedShoppingItems(req.user.id));
});

router.delete("/:id", async (req, res) => {
  res.json(await deleteShoppingItem(req.user.id, Number(req.params.id)));
});

module.exports = router;
