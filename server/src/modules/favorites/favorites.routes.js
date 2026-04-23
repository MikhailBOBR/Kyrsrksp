const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const {
  addFavoriteProduct,
  addFavoriteTemplate,
  listFavorites,
  removeFavoriteProduct,
  removeFavoriteTemplate
} = require("./favorites.service");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  res.json(await listFavorites(req.user.id));
});

router.post("/products/:productId", async (req, res) => {
  res.status(201).json(await addFavoriteProduct(req.user.id, Number(req.params.productId)));
});

router.delete("/products/:productId", async (req, res) => {
  res.json(await removeFavoriteProduct(req.user.id, Number(req.params.productId)));
});

router.post("/templates/:templateId", async (req, res) => {
  res.status(201).json(await addFavoriteTemplate(req.user.id, Number(req.params.templateId)));
});

router.delete("/templates/:templateId", async (req, res) => {
  res.json(await removeFavoriteTemplate(req.user.id, Number(req.params.templateId)));
});

module.exports = router;
