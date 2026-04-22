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

router.get("/", (req, res) => {
  res.json(listFavorites(req.user.id));
});

router.post("/products/:productId", (req, res) => {
  res.status(201).json(addFavoriteProduct(req.user.id, Number(req.params.productId)));
});

router.delete("/products/:productId", (req, res) => {
  res.json(removeFavoriteProduct(req.user.id, Number(req.params.productId)));
});

router.post("/templates/:templateId", (req, res) => {
  res.status(201).json(addFavoriteTemplate(req.user.id, Number(req.params.templateId)));
});

router.delete("/templates/:templateId", (req, res) => {
  res.json(removeFavoriteTemplate(req.user.id, Number(req.params.templateId)));
});

module.exports = router;
