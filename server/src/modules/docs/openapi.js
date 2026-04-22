function secured(summary, tags) {
  return {
    tags,
    summary,
    security: [{ bearerAuth: [] }]
  };
}

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "NutriTrack API",
    version: "1.3.0",
    description:
      "API for the personal nutrition diary with KBJU analytics, planning, recipes, hydration, wellbeing and exports."
  },
  servers: [
    {
      url: "http://localhost:8080"
    }
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Goals" },
    { name: "Products" },
    { name: "Meals" },
    { name: "Dashboard" },
    { name: "Hydration" },
    { name: "Templates" },
    { name: "Recipes" },
    { name: "Exports" },
    { name: "Checkins" },
    { name: "Metrics" },
    { name: "Planner" },
    { name: "Shopping" },
    { name: "Day Notes" },
    { name: "Favorites" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Service is available"
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user"
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate user"
      }
    },
    "/api/auth/me": {
      get: secured("Get current user profile", ["Auth"])
    },
    "/api/goals": {
      get: secured("Get KBJU goals", ["Goals"]),
      put: secured("Update KBJU goals", ["Goals"])
    },
    "/api/goals/presets": {
      get: secured("List goal presets", ["Goals"])
    },
    "/api/goals/presets/{presetId}/apply": {
      post: secured("Apply goal preset", ["Goals"])
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List products"
      },
      post: secured("Create product", ["Products"])
    },
    "/api/products/{id}": {
      put: secured("Update product", ["Products"]),
      delete: secured("Delete product", ["Products"])
    },
    "/api/meals": {
      get: secured("List meal entries", ["Meals"]),
      post: secured("Create meal entry", ["Meals"])
    },
    "/api/meals/{id}": {
      put: secured("Update meal entry", ["Meals"]),
      delete: secured("Delete meal entry", ["Meals"])
    },
    "/api/dashboard": {
      get: secured("Get user dashboard", ["Dashboard"])
    },
    "/api/hydration": {
      get: secured("Get daily hydration summary", ["Hydration"]),
      post: secured("Create hydration entry", ["Hydration"])
    },
    "/api/hydration/{id}": {
      delete: secured("Delete hydration entry", ["Hydration"])
    },
    "/api/templates": {
      get: secured("List meal templates", ["Templates"]),
      post: secured("Create meal template", ["Templates"])
    },
    "/api/templates/from-meal/{mealId}": {
      post: secured("Create template from meal", ["Templates"])
    },
    "/api/templates/{id}/apply": {
      post: secured("Apply template as meal", ["Templates"])
    },
    "/api/templates/{id}": {
      delete: secured("Delete meal template", ["Templates"])
    },
    "/api/recipes": {
      get: secured("List recipes", ["Recipes"]),
      post: secured("Create recipe", ["Recipes"])
    },
    "/api/recipes/{id}/apply": {
      post: secured("Apply recipe as meal", ["Recipes"])
    },
    "/api/recipes/{id}/plan": {
      post: secured("Create plan from recipe", ["Recipes"])
    },
    "/api/recipes/{id}": {
      delete: secured("Delete recipe", ["Recipes"])
    },
    "/api/exports/daily-report": {
      get: secured("Export daily report as JSON or CSV", ["Exports"])
    },
    "/api/checkins": {
      get: secured("Get wellbeing check-in summary", ["Checkins"]),
      put: secured("Create or update wellbeing check-in", ["Checkins"]),
      delete: secured("Delete wellbeing check-in by date", ["Checkins"])
    },
    "/api/metrics": {
      get: secured("Get body metrics history", ["Metrics"]),
      post: secured("Create body metric entry", ["Metrics"])
    },
    "/api/metrics/{id}": {
      delete: secured("Delete body metric entry", ["Metrics"])
    },
    "/api/planner": {
      get: secured("Get meal planner data", ["Planner"]),
      post: secured("Create planner entry", ["Planner"])
    },
    "/api/planner/from-template/{templateId}": {
      post: secured("Create planner entry from template", ["Planner"])
    },
    "/api/planner/generate-week": {
      post: secured("Generate weekly meal plan", ["Planner"])
    },
    "/api/planner/{id}/completion": {
      patch: secured("Update planner completion state", ["Planner"])
    },
    "/api/planner/{id}": {
      delete: secured("Delete planner entry", ["Planner"])
    },
    "/api/shopping": {
      get: secured("Get shopping list", ["Shopping"]),
      post: secured("Create shopping list entry", ["Shopping"])
    },
    "/api/shopping/from-product/{productId}": {
      post: secured("Add product to shopping list", ["Shopping"])
    },
    "/api/shopping/{id}/check": {
      patch: secured("Toggle shopping entry state", ["Shopping"])
    },
    "/api/shopping/checked": {
      delete: secured("Clear checked shopping entries", ["Shopping"])
    },
    "/api/shopping/{id}": {
      delete: secured("Delete shopping entry", ["Shopping"])
    },
    "/api/day-notes": {
      get: secured("Get note for selected day", ["Day Notes"]),
      put: secured("Create or update day note", ["Day Notes"]),
      delete: secured("Delete day note", ["Day Notes"])
    },
    "/api/day-notes/recent": {
      get: secured("Get recent day notes", ["Day Notes"])
    },
    "/api/favorites": {
      get: secured("Get favorite products and templates", ["Favorites"])
    },
    "/api/favorites/products/{productId}": {
      post: secured("Add product to favorites", ["Favorites"]),
      delete: secured("Remove product from favorites", ["Favorites"])
    },
    "/api/favorites/templates/{templateId}": {
      post: secured("Add template to favorites", ["Favorites"]),
      delete: secured("Remove template from favorites", ["Favorites"])
    }
  }
};

module.exports = {
  openApiDocument
};
