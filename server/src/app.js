const path = require("node:path");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { appEnv, clientRoot, dbProvider, releaseVersion, serviceName, trustProxy } = require("./config/env");
const { pingDatabase } = require("./db/connection");
const { errorHandler } = require("./middlewares/error-handler");
const { rejectWhenDraining, requestContext } = require("./middlewares/request-context");
const { isDraining } = require("./runtime/state");
const authRoutes = require("./modules/auth/auth.routes");
const goalsRoutes = require("./modules/goals/goals.routes");
const productsRoutes = require("./modules/products/products.routes");
const mealsRoutes = require("./modules/meals/meals.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const hydrationRoutes = require("./modules/hydration/hydration.routes");
const templatesRoutes = require("./modules/templates/templates.routes");
const exportsRoutes = require("./modules/exports/exports.routes");
const checkinsRoutes = require("./modules/checkins/checkins.routes");
const metricsRoutes = require("./modules/metrics/metrics.routes");
const plannerRoutes = require("./modules/planner/planner.routes");
const shoppingRoutes = require("./modules/shopping/shopping.routes");
const dayNotesRoutes = require("./modules/day-notes/day-notes.routes");
const favoritesRoutes = require("./modules/favorites/favorites.routes");
const recipesRoutes = require("./modules/recipes/recipes.routes");
const importsRoutes = require("./modules/imports/imports.routes");
const { openApiDocument } = require("./modules/docs/openapi");
const { swaggerUiOptions } = require("./modules/docs/swagger-ui");

function runtimeStatus(overrides = {}) {
  const draining = isDraining();

  return {
    status: draining ? "draining" : "ok",
    ready: !draining,
    service: serviceName,
    version: releaseVersion,
    environment: appEnv,
    stack: `express + ${dbProvider} + swagger`,
    ...overrides
  };
}

function createApp() {
  const app = express();

  if (trustProxy) {
    app.set("trust proxy", true);
  }

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: false, limit: "2mb" }));
  app.use(requestContext);
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    next();
  });
  app.use((req, res, next) => {
    if (req.path === "/" || req.path === "/index.html" || req.path === "/app.js") {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Pragma", "no-cache");
    }

    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json(runtimeStatus());
  });

  app.get("/api/live", (_req, res) => {
    res.json(runtimeStatus({ alive: true }));
  });

  app.get("/api/ready", async (req, res) => {
    if (isDraining()) {
      res.status(503).json(
        runtimeStatus({
          ready: false,
          checks: {
            database: {
              provider: dbProvider,
              status: "skipped"
            }
          }
        })
      );
      return;
    }

    try {
      const database = await pingDatabase();
      const ready = Boolean(database.ok);

      res.status(ready ? 200 : 503).json(
        runtimeStatus({
          ready,
          checks: {
            database: {
              provider: database.provider,
              status: ready ? "ok" : "failed"
            }
          }
        })
      );
    } catch (error) {
      req.log.error("runtime.readiness.failed", { error });
      res.status(503).json(
        runtimeStatus({
          ready: false,
          checks: {
            database: {
              provider: dbProvider,
              status: "failed"
            }
          }
        })
      );
    }
  });

  app.use(rejectWhenDraining);

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, swaggerUiOptions));
  app.get("/api/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/goals", goalsRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/meals", mealsRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/hydration", hydrationRoutes);
  app.use("/api/templates", templatesRoutes);
  app.use("/api/exports", exportsRoutes);
  app.use("/api/checkins", checkinsRoutes);
  app.use("/api/metrics", metricsRoutes);
  app.use("/api/planner", plannerRoutes);
  app.use("/api/shopping", shoppingRoutes);
  app.use("/api/day-notes", dayNotesRoutes);
  app.use("/api/favorites", favoritesRoutes);
  app.use("/api/recipes", recipesRoutes);
  app.use("/api/imports", importsRoutes);

  app.use(express.static(clientRoot));

  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientRoot, "index.html"));
  });

  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      res.status(404).json({
        error: "Route not found",
        requestId: req.requestId
      });
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
