const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "NutriTrack API",
    version: "1.2.0",
    description:
      "API клиент-серверного приложения для персонального дневника питания с анализом КБЖУ."
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
        summary: "Проверка состояния сервиса",
        responses: {
          200: {
            description: "Сервис работает"
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Регистрация пользователя"
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Вход пользователя"
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Текущий пользователь",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/goals": {
      get: {
        tags: ["Goals"],
        summary: "Получить цели по КБЖУ",
        security: [{ bearerAuth: [] }]
      },
      put: {
        tags: ["Goals"],
        summary: "Обновить цели по КБЖУ",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/goals/presets": {
      get: {
        tags: ["Goals"],
        summary: "Получить список пресетов целей",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/goals/presets/{presetId}/apply": {
      post: {
        tags: ["Goals"],
        summary: "Применить пресет целей",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Список продуктов"
      },
      post: {
        tags: ["Products"],
        summary: "Создать продукт",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/products/{id}": {
      put: {
        tags: ["Products"],
        summary: "Обновить продукт",
        security: [{ bearerAuth: [] }]
      },
      delete: {
        tags: ["Products"],
        summary: "Удалить продукт",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/meals": {
      get: {
        tags: ["Meals"],
        summary: "Список приемов пищи",
        security: [{ bearerAuth: [] }]
      },
      post: {
        tags: ["Meals"],
        summary: "Создать прием пищи",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/meals/{id}": {
      put: {
        tags: ["Meals"],
        summary: "Обновить прием пищи",
        security: [{ bearerAuth: [] }]
      },
      delete: {
        tags: ["Meals"],
        summary: "Удалить прием пищи",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Главный dashboard пользователя",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/hydration": {
      get: {
        tags: ["Hydration"],
        summary: "Сводка по воде за день",
        security: [{ bearerAuth: [] }]
      },
      post: {
        tags: ["Hydration"],
        summary: "Добавить запись воды",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/hydration/{id}": {
      delete: {
        tags: ["Hydration"],
        summary: "Удалить запись воды",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/templates": {
      get: {
        tags: ["Templates"],
        summary: "Список шаблонов приемов пищи",
        security: [{ bearerAuth: [] }]
      },
      post: {
        tags: ["Templates"],
        summary: "Создать шаблон приема пищи",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/templates/from-meal/{mealId}": {
      post: {
        tags: ["Templates"],
        summary: "Создать шаблон из существующего приема пищи",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/templates/{id}/apply": {
      post: {
        tags: ["Templates"],
        summary: "Применить шаблон и создать запись приема пищи",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/templates/{id}": {
      delete: {
        tags: ["Templates"],
        summary: "Удалить шаблон",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/exports/daily-report": {
      get: {
        tags: ["Exports"],
        summary: "Экспорт дневного отчета в JSON или CSV",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/checkins": {
      get: {
        tags: ["Checkins"],
        summary: "Получить wellbeing-запись и тренд",
        security: [{ bearerAuth: [] }]
      },
      put: {
        tags: ["Checkins"],
        summary: "Создать или обновить wellbeing-запись",
        security: [{ bearerAuth: [] }]
      },
      delete: {
        tags: ["Checkins"],
        summary: "Удалить wellbeing-запись по дате",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/metrics": {
      get: {
        tags: ["Metrics"],
        summary: "Получить историю замеров тела",
        security: [{ bearerAuth: [] }]
      },
      post: {
        tags: ["Metrics"],
        summary: "Добавить замер тела",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/metrics/{id}": {
      delete: {
        tags: ["Metrics"],
        summary: "Удалить замер тела",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/planner": {
      get: {
        tags: ["Planner"],
        summary: "Получить план приемов пищи",
        security: [{ bearerAuth: [] }]
      },
      post: {
        tags: ["Planner"],
        summary: "Создать план приема пищи",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/planner/from-template/{templateId}": {
      post: {
        tags: ["Planner"],
        summary: "Создать план на основе шаблона",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/planner/{id}/completion": {
      patch: {
        tags: ["Planner"],
        summary: "Изменить статус выполнения плана",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/planner/{id}": {
      delete: {
        tags: ["Planner"],
        summary: "Удалить план приема пищи",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/shopping": {
      get: {
        tags: ["Shopping"],
        summary: "Получить список покупок",
        security: [{ bearerAuth: [] }]
      },
      post: {
        tags: ["Shopping"],
        summary: "Добавить позицию в список покупок",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/shopping/from-product/{productId}": {
      post: {
        tags: ["Shopping"],
        summary: "Добавить продукт из каталога в список покупок",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/shopping/{id}/check": {
      patch: {
        tags: ["Shopping"],
        summary: "Изменить статус покупки",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/shopping/checked": {
      delete: {
        tags: ["Shopping"],
        summary: "Очистить закрытые позиции списка покупок",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/shopping/{id}": {
      delete: {
        tags: ["Shopping"],
        summary: "Удалить позицию из списка покупок",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/day-notes": {
      get: {
        tags: ["Day Notes"],
        summary: "Получить заметку дня",
        security: [{ bearerAuth: [] }]
      },
      put: {
        tags: ["Day Notes"],
        summary: "Создать или обновить заметку дня",
        security: [{ bearerAuth: [] }]
      },
      delete: {
        tags: ["Day Notes"],
        summary: "Удалить заметку дня",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/day-notes/recent": {
      get: {
        tags: ["Day Notes"],
        summary: "Получить последние заметки дня",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "Получить избранные продукты и шаблоны",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/favorites/products/{productId}": {
      post: {
        tags: ["Favorites"],
        summary: "Добавить продукт в избранное",
        security: [{ bearerAuth: [] }]
      },
      delete: {
        tags: ["Favorites"],
        summary: "Убрать продукт из избранного",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/favorites/templates/{templateId}": {
      post: {
        tags: ["Favorites"],
        summary: "Добавить шаблон в избранное",
        security: [{ bearerAuth: [] }]
      },
      delete: {
        tags: ["Favorites"],
        summary: "Убрать шаблон из избранного",
        security: [{ bearerAuth: [] }]
      }
    }
  }
};

module.exports = {
  openApiDocument
};
