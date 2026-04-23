const express = require("express");
const { requireAuth, requireRole } = require("../../middlewares/auth");
const {
  assertNonEmptyString,
  assertNumber,
  assertProductCategory
} = require("../../lib/validation");
const {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct
} = require("./products.service");

const router = express.Router();

function validateProductPayload(payload) {
  assertNonEmptyString(payload.name, "name");
  assertProductCategory(payload.category);
  assertNumber(payload.calories, "calories");
  assertNumber(payload.protein, "protein");
  assertNumber(payload.fat, "fat");
  assertNumber(payload.carbs, "carbs");

  if (payload.brand !== undefined && payload.brand !== null && payload.brand !== "") {
    assertNonEmptyString(payload.brand, "brand");
  }
}

router.get("/", async (req, res) => {
  res.json(
    await listProducts({
      search: req.query.search?.trim(),
      category: req.query.category?.trim()
    })
  );
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  validateProductPayload(req.body);
  res.status(201).json(await createProduct(req.body, req.user.id));
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  validateProductPayload(req.body);
  res.json(await updateProduct(Number(req.params.id), req.body));
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  res.json(await deleteProduct(Number(req.params.id)));
});

module.exports = router;
