const express = require("express");
const { requireAuth } = require("../../middlewares/auth");
const { buildTemplateFile, previewImport, applyImport } = require("./imports.service");

const router = express.Router();

router.use(requireAuth);

router.get("/template", (req, res) => {
  const template = buildTemplateFile(req.query.dataset, req.query.format || "json");

  res.setHeader("Content-Type", template.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${template.filename}"`);
  res.send(template.content);
});

router.post("/preview", (req, res) => {
  const preview = previewImport(req.user, req.body);
  res.json({
    dataset: preview.dataset,
    datasetLabel: preview.datasetLabel,
    format: preview.format,
    columns: preview.columns,
    summary: preview.summary,
    previewItems: preview.previewItems,
    issues: preview.issues
  });
});

router.post("/apply", async (req, res) => {
  const result = await applyImport(req.user, req.body);
  res.status(201).json(result);
});

module.exports = router;
