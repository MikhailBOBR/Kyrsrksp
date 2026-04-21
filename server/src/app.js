const path = require("node:path");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { clientRoot } = require("./config/env");
const { errorHandler } = require("./middlewares/error-handler");
const authRoutes = require("./modules/auth/auth.routes");
const goalsRoutes = require("./modules/goals/goals.routes");
const productsRoutes = require("./modules/products/products.routes");
const mealsRoutes = require("./modules/meals/meals.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const { openApiDocument } = require("./modules/docs/openapi");

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "food-diary-app",
      stack: "express + sqlite + swagger"
    });
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get("/api/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/goals", goalsRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/meals", mealsRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use(express.static(clientRoot));

  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientRoot, "index.html"));
  });

  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      res.status(404).json({ error: "Route not found" });
      return;
    }

    next();
  });

  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
