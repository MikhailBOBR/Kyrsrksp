const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "NutriTrack API",
    version: "1.0.0",
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
    { name: "Exports" }
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
        summary: "Регистрация пользователя",
        responses: {
          201: {
            description: "Пользователь создан"
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Вход пользователя",
        responses: {
          200: {
            description: "Успешная аутентификация"
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Текущий пользователь",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Данные текущего пользователя"
          }
        }
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
        summary: "Список приёмов пищи",
        security: [{ bearerAuth: [] }]
      },
      post: {
        tags: ["Meals"],
        summary: "Создать приём пищи",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/meals/{id}": {
      put: {
        tags: ["Meals"],
        summary: "Обновить приём пищи",
        security: [{ bearerAuth: [] }]
      },
      delete: {
        tags: ["Meals"],
        summary: "Удалить приём пищи",
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
        summary: "Список шаблонов приёмов пищи",
        security: [{ bearerAuth: [] }]
      },
      post: {
        tags: ["Templates"],
        summary: "Создать шаблон приёма пищи",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/templates/from-meal/{mealId}": {
      post: {
        tags: ["Templates"],
        summary: "Создать шаблон из существующего приёма пищи",
        security: [{ bearerAuth: [] }]
      }
    },
    "/api/templates/{id}/apply": {
      post: {
        tags: ["Templates"],
        summary: "Применить шаблон и создать запись приёма пищи",
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
        summary: "Экспорт дневного отчёта в JSON или CSV",
        security: [{ bearerAuth: [] }]
      }
    }
  }
};

module.exports = {
  openApiDocument
};
