const packageJson = require("../../../../package.json");

function secured(summary, tags, extra = {}) {
  return {
    tags,
    summary,
    security: [{ bearerAuth: [] }],
    responses: {
      401: {
        $ref: "#/components/responses/UnauthorizedError"
      },
      ...(extra.responses || {})
    },
    ...extra
  };
}

function jsonResponse(description, schema) {
  return {
    description,
    content: {
      "application/json": {
        schema
      }
    }
  };
}

function ref(schemaName) {
  return {
    $ref: `#/components/schemas/${schemaName}`
  };
}

function arrayOf(schema) {
  return {
    type: "array",
    items: schema
  };
}

function pathParameter(name) {
  const integerNames = new Set(["id", "productId", "templateId", "mealId"]);

  return {
    in: "path",
    name,
    required: true,
    schema: {
      type: integerNames.has(name) ? "integer" : "string"
    },
    description: `Path parameter: ${name}.`
  };
}

function operationIdFor(method, pathname) {
  const cleanPath = pathname
    .replace(/^\/api\//, "")
    .replace(/[{}]/g, "")
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()))
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");

  return `${method}${cleanPath.charAt(0).toUpperCase()}${cleanPath.slice(1)}`;
}

function mergeResponses(operation, responses) {
  operation.responses = {
    ...(operation.responses || {}),
    ...responses
  };
}

function applyOpenApiPolish(document) {
  Object.assign(document.components.responses, {
    ForbiddenError: jsonResponse("Недостаточно прав для выполнения операции.", ref("ErrorResponse")),
    NotFoundError: jsonResponse("Запрошенная сущность не найдена.", ref("ErrorResponse")),
    ServerError: jsonResponse("Внутренняя ошибка сервера.", ref("ErrorResponse"))
  });

  Object.assign(document.components.schemas, {
    HealthResponse: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["ok", "draining"], example: "ok" },
        ready: { type: "boolean", example: true },
        alive: { type: "boolean", example: true },
        service: { type: "string", example: "food-diary-app" },
        version: { type: "string", example: packageJson.version },
        environment: { type: "string", example: "production" },
        stack: { type: "string", example: "express + postgres + swagger" },
        checks: {
          type: "object",
          properties: {
            database: {
              type: "object",
              properties: {
                provider: { type: "string", example: "postgres" },
                status: { type: "string", enum: ["ok", "failed", "skipped"], example: "ok" }
              }
            }
          }
        }
      },
      required: ["status", "ready", "service", "version", "environment", "stack"]
    },
    GoalPreset: {
      type: "object",
      properties: {
        id: { type: "string", example: "high-protein" },
        title: { type: "string", example: "Высокий белок" },
        description: { type: "string", example: "Цель для силовых тренировок и удержания сытости." },
        goals: ref("Goals")
      },
      required: ["id", "title", "description", "goals"]
    },
    HydrationEntry: {
      type: "object",
      properties: {
        id: { type: "integer", example: 8 },
        date: { type: "string", format: "date", example: "2026-04-23" },
        time: { type: "string", example: "12:20" },
        amountMl: { type: "number", example: 350 },
        note: { type: "string", example: "После тренировки" }
      },
      required: ["id", "date", "time", "amountMl"]
    },
    HydrationSummary: {
      type: "object",
      properties: {
        date: { type: "string", format: "date", example: "2026-04-23" },
        totalMl: { type: "number", example: 1600 },
        entries: arrayOf(ref("HydrationEntry"))
      },
      required: ["date", "totalMl", "entries"]
    },
    MealTemplate: {
      type: "object",
      properties: {
        id: { type: "integer", example: 3 },
        title: { type: "string", example: "Белковый завтрак" },
        mealType: { type: "string", example: "Завтрак" },
        grams: { type: "number", example: 260 },
        calories: { type: "number", example: 430 },
        protein: { type: "number", example: 32 },
        fat: { type: "number", example: 12 },
        carbs: { type: "number", example: 42 },
        notes: { type: "string", example: "Быстро повторить в рабочий день" }
      },
      required: ["id", "title", "mealType", "grams", "calories", "protein", "fat", "carbs"]
    },
    RecipeIngredient: {
      type: "object",
      properties: {
        productId: { type: "integer", example: 4 },
        name: { type: "string", example: "Куриная грудка" },
        grams: { type: "number", example: 180 }
      },
      required: ["productId", "grams"]
    },
    Recipe: {
      type: "object",
      properties: {
        id: { type: "integer", example: 7 },
        title: { type: "string", example: "Куриная миска с киноа" },
        mealType: { type: "string", example: "Обед" },
        servings: { type: "number", example: 2 },
        instructions: { type: "string", example: "Отварить крупу, добавить белок и овощи." },
        ingredients: arrayOf(ref("RecipeIngredient")),
        calories: { type: "number", example: 520 },
        protein: { type: "number", example: 42 },
        fat: { type: "number", example: 14 },
        carbs: { type: "number", example: 56 }
      },
      required: ["id", "title", "mealType", "servings", "instructions", "ingredients"]
    },
    Checkin: {
      type: "object",
      properties: {
        date: { type: "string", format: "date", example: "2026-04-23" },
        mood: { type: "number", example: 7 },
        energy: { type: "number", example: 8 },
        sleepHours: { type: "number", example: 7.5 },
        stress: { type: "number", example: 3 },
        readinessScore: { type: "number", example: 78 }
      },
      required: ["date", "mood", "energy", "sleepHours", "stress"]
    },
    BodyMetric: {
      type: "object",
      properties: {
        id: { type: "integer", example: 11 },
        date: { type: "string", format: "date", example: "2026-04-23" },
        weightKg: { type: "number", example: 78.4 },
        waistCm: { type: "number", example: 84 },
        bodyFatPercent: { type: "number", example: 18.5 },
        note: { type: "string", example: "Утренний замер" }
      },
      required: ["id", "date"]
    },
    PlannerEntry: {
      type: "object",
      properties: {
        id: { type: "integer", example: 15 },
        date: { type: "string", format: "date", example: "2026-04-23" },
        mealType: { type: "string", example: "Обед" },
        title: { type: "string", example: "Курица с рисом" },
        isCompleted: { type: "boolean", example: false },
        calories: { type: "number", example: 610 },
        protein: { type: "number", example: 44 },
        fat: { type: "number", example: 18 },
        carbs: { type: "number", example: 66 }
      },
      required: ["id", "date", "mealType", "title", "isCompleted"]
    },
    ShoppingItem: {
      type: "object",
      properties: {
        id: { type: "integer", example: 20 },
        title: { type: "string", example: "Кефир 1%" },
        category: { type: "string", example: "Напитки" },
        quantity: { type: "string", example: "1 л" },
        isChecked: { type: "boolean", example: false }
      },
      required: ["id", "title", "isChecked"]
    },
    DayNote: {
      type: "object",
      properties: {
        date: { type: "string", format: "date", example: "2026-04-23" },
        focus: { type: "string", example: "Собрать белок в первой половине дня" },
        note: { type: "string", example: "День прошел спокойно, план почти выполнен." }
      },
      required: ["date"]
    },
    FavoritesResponse: {
      type: "object",
      properties: {
        products: arrayOf(ref("Product")),
        templates: arrayOf(ref("MealTemplate"))
      },
      required: ["products", "templates"]
    }
  });

  const contracts = {
    "/api/health": {
      get: {
        200: jsonResponse("Сервис доступен.", ref("HealthResponse"))
      }
    },
    "/api/live": {
      get: {
        200: jsonResponse("Runtime process is alive.", ref("HealthResponse"))
      }
    },
    "/api/ready": {
      get: {
        200: jsonResponse("Runtime and backing services are ready.", ref("HealthResponse")),
        503: jsonResponse("Runtime is not ready.", ref("HealthResponse"))
      }
    },
    "/api/goals/presets": {
      get: {
        200: jsonResponse("Список готовых пресетов целей.", arrayOf(ref("GoalPreset")))
      }
    },
    "/api/goals/presets/{presetId}/apply": {
      post: {
        200: jsonResponse("Пресет применен к текущим целям пользователя.", {
          type: "object",
          properties: {
            preset: ref("GoalPreset"),
            goals: ref("Goals")
          },
          required: ["preset", "goals"]
        }),
        404: { $ref: "#/components/responses/NotFoundError" }
      }
    },
    "/api/products/{id}": {
      put: {
        200: jsonResponse("Продукт обновлен.", ref("Product")),
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" }
      },
      delete: {
        200: jsonResponse("Продукт удален.", ref("Product")),
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" }
      }
    },
    "/api/meals/{id}": {
      put: {
        200: jsonResponse("Запись дневника обновлена.", ref("MealEntry")),
        404: { $ref: "#/components/responses/NotFoundError" }
      },
      delete: {
        200: jsonResponse("Запись дневника удалена.", ref("MealEntry")),
        404: { $ref: "#/components/responses/NotFoundError" }
      }
    },
    "/api/hydration": {
      get: { 200: jsonResponse("Дневная сводка по воде.", ref("HydrationSummary")) },
      post: { 201: jsonResponse("Запись воды создана.", ref("HydrationEntry")) }
    },
    "/api/hydration/{id}": {
      delete: { 200: jsonResponse("Запись воды удалена.", ref("HydrationEntry")) }
    },
    "/api/templates": {
      get: { 200: jsonResponse("Список шаблонов пользователя.", arrayOf(ref("MealTemplate"))) },
      post: { 201: jsonResponse("Шаблон создан.", ref("MealTemplate")) }
    },
    "/api/templates/from-meal/{mealId}": {
      post: { 201: jsonResponse("Шаблон создан из записи дневника.", ref("MealTemplate")) }
    },
    "/api/templates/{id}/apply": {
      post: { 201: jsonResponse("Шаблон применен как прием пищи.", ref("MealEntry")) }
    },
    "/api/templates/{id}": {
      delete: { 200: jsonResponse("Шаблон удален.", ref("MealTemplate")) }
    },
    "/api/recipes": {
      get: { 200: jsonResponse("Список рецептов пользователя.", arrayOf(ref("Recipe"))) },
      post: { 201: jsonResponse("Рецепт создан.", ref("Recipe")) }
    },
    "/api/recipes/{id}/apply": {
      post: { 201: jsonResponse("Рецепт добавлен в дневник.", ref("MealEntry")) }
    },
    "/api/recipes/{id}/plan": {
      post: { 201: jsonResponse("Рецепт добавлен в план питания.", ref("PlannerEntry")) }
    },
    "/api/recipes/{id}": {
      delete: { 200: jsonResponse("Рецепт удален.", ref("Recipe")) }
    },
    "/api/checkins": {
      get: { 200: jsonResponse("Сводка по самочувствию.", ref("Checkin")) },
      put: { 200: jsonResponse("Check-in создан или обновлен.", ref("Checkin")) },
      delete: { 200: jsonResponse("Check-in удален.", ref("Checkin")) }
    },
    "/api/metrics": {
      get: { 200: jsonResponse("История замеров тела.", arrayOf(ref("BodyMetric"))) },
      post: { 201: jsonResponse("Замер тела создан.", ref("BodyMetric")) }
    },
    "/api/metrics/{id}": {
      delete: { 200: jsonResponse("Замер тела удален.", ref("BodyMetric")) }
    },
    "/api/planner": {
      get: { 200: jsonResponse("План питания пользователя.", arrayOf(ref("PlannerEntry"))) },
      post: { 201: jsonResponse("Позиция плана создана.", ref("PlannerEntry")) }
    },
    "/api/planner/from-template/{templateId}": {
      post: { 201: jsonResponse("Шаблон добавлен в план питания.", ref("PlannerEntry")) }
    },
    "/api/planner/generate-week": {
      post: {
        201: jsonResponse("Недельный план сгенерирован.", {
          type: "object",
          properties: {
            items: arrayOf(ref("PlannerEntry"))
          },
          required: ["items"]
        })
      }
    },
    "/api/planner/{id}/completion": {
      patch: { 200: jsonResponse("Статус выполнения обновлен.", ref("PlannerEntry")) }
    },
    "/api/planner/{id}": {
      delete: { 200: jsonResponse("Позиция плана удалена.", ref("PlannerEntry")) }
    },
    "/api/shopping": {
      get: { 200: jsonResponse("Список покупок пользователя.", arrayOf(ref("ShoppingItem"))) },
      post: { 201: jsonResponse("Позиция списка покупок создана.", ref("ShoppingItem")) }
    },
    "/api/shopping/from-product/{productId}": {
      post: { 201: jsonResponse("Продукт добавлен в список покупок.", ref("ShoppingItem")) }
    },
    "/api/shopping/{id}/check": {
      patch: { 200: jsonResponse("Статус покупки переключен.", ref("ShoppingItem")) }
    },
    "/api/shopping/checked": {
      delete: {
        200: jsonResponse("Отмеченные покупки очищены.", {
          type: "object",
          properties: {
            deleted: { type: "integer", example: 3 }
          },
          required: ["deleted"]
        })
      }
    },
    "/api/shopping/{id}": {
      delete: { 200: jsonResponse("Позиция списка покупок удалена.", ref("ShoppingItem")) }
    },
    "/api/day-notes": {
      get: { 200: jsonResponse("Заметка выбранного дня.", ref("DayNote")) },
      put: { 200: jsonResponse("Заметка дня сохранена.", ref("DayNote")) },
      delete: { 200: jsonResponse("Заметка дня удалена.", ref("DayNote")) }
    },
    "/api/day-notes/recent": {
      get: { 200: jsonResponse("Последние заметки дня.", arrayOf(ref("DayNote"))) }
    },
    "/api/favorites": {
      get: { 200: jsonResponse("Избранные продукты и шаблоны.", ref("FavoritesResponse")) }
    },
    "/api/favorites/products/{productId}": {
      post: { 201: jsonResponse("Продукт добавлен в избранное.", ref("Product")) },
      delete: { 200: jsonResponse("Продукт удален из избранного.", ref("Product")) }
    },
    "/api/favorites/templates/{templateId}": {
      post: { 201: jsonResponse("Шаблон добавлен в избранное.", ref("MealTemplate")) },
      delete: { 200: jsonResponse("Шаблон удален из избранного.", ref("MealTemplate")) }
    }
  };

  Object.entries(document.paths).forEach(([pathname, pathItem]) => {
    const parameterNames = [...pathname.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);

    Object.entries(pathItem).forEach(([method, operation]) => {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) {
        return;
      }

      operation.operationId = operation.operationId || operationIdFor(method, pathname);
      operation.responses = operation.responses || {};

      parameterNames.forEach((name) => {
        const parameters = operation.parameters || [];
        if (!parameters.some((parameter) => parameter.in === "path" && parameter.name === name)) {
          operation.parameters = [...parameters, pathParameter(name)];
        }
      });

      if (operation.security) {
        operation.responses[401] = operation.responses[401] || { $ref: "#/components/responses/UnauthorizedError" };
      }

      const contractResponses = contracts[pathname]?.[method];
      if (contractResponses) {
        mergeResponses(operation, contractResponses);
      }

      operation.responses[500] = operation.responses[500] || { $ref: "#/components/responses/ServerError" };
    });
  });
}

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Рацион API",
    version: packageJson.version,
    description: [
      "REST API для курсового проекта «Персональный дневник питания с анализом КБЖУ».",
      "",
      "Что умеет система:",
      "- вести дневник питания и расчёт КБЖУ;",
      "- управлять целями, шаблонами, рецептами и недельным планом;",
      "- учитывать воду, самочувствие, замеры тела и список покупок;",
      "- формировать ежедневную аналитику, экспортировать отчёты и импортировать данные из внешних файлов;",
      "- обеспечивать ролевой доступ `user/admin` и JWT-аутентификацию.",
      "",
      "Для защищённых маршрутов используйте `Authorize` и передавайте JWT в формате `Bearer <token>`."
    ].join("\n"),
    contact: {
      name: "Курсовой проект «Рацион»"
    }
  },
  servers: [
    {
      url: "/",
      description: "Текущий хост приложения"
    },
    {
      url: "http://localhost:8080",
      description: "Локальное окружение"
    }
  ],
  tags: [
    { name: "Health", description: "Проверка доступности сервиса и технологического стека." },
    { name: "Auth", description: "Регистрация, вход и получение текущего профиля пользователя." },
    { name: "Goals", description: "Управление персональными целями по КБЖУ и пресетами." },
    { name: "Products", description: "Каталог продуктов и административное управление справочником." },
    { name: "Meals", description: "CRUD-операции с дневником приёмов пищи." },
    { name: "Dashboard", description: "Главная аналитическая панель пользователя за выбранную дату." },
    { name: "Hydration", description: "Трекер воды и агрегированная гидратация." },
    { name: "Templates", description: "Шаблоны приёмов пищи для ускоренного повторного ввода." },
    { name: "Recipes", description: "Составные рецепты и сценарии применения в журнале и плане." },
    { name: "Exports", description: "Экспорт ежедневного отчёта в JSON." },
    { name: "Imports", description: "Предпросмотр, шаблоны и импорт данных из JSON и TSV." },
    { name: "Checkins", description: "Самочувствие, readiness score и дневные check-in записи." },
    { name: "Metrics", description: "Замеры тела и прогресс физических показателей." },
    { name: "Planner", description: "Планировщик питания, ручные и автоматические недельные планы." },
    { name: "Shopping", description: "Список покупок и контроль отмеченных позиций." },
    { name: "Day Notes", description: "Заметки дня, фокус, выводы и короткие итоги." },
    { name: "Favorites", description: "Избранные продукты и шаблоны для быстрого доступа." }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    parameters: {
      DateParameter: {
        in: "query",
        name: "date",
        schema: {
          type: "string",
          format: "date",
          example: "2026-04-23"
        },
        description: "Дата в формате YYYY-MM-DD."
      }
    },
    responses: {
      UnauthorizedError: jsonResponse("JWT отсутствует или недействителен.", {
        $ref: "#/components/schemas/ErrorResponse"
      }),
      ValidationError: jsonResponse("Запрос не прошёл валидацию.", {
        $ref: "#/components/schemas/ErrorResponse"
      })
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "Route not found"
          }
        },
        required: ["error"]
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Demo User" },
          email: { type: "string", format: "email", example: "demo@nutritrack.local" },
          role: { type: "string", enum: ["user", "admin"], example: "user" },
          createdAt: { type: "string", example: "2026-04-23T10:00:00Z" }
        },
        required: ["id", "name", "email", "role"]
      },
      AuthPayload: {
        type: "object",
        properties: {
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          },
          user: {
            $ref: "#/components/schemas/User"
          }
        },
        required: ["token", "user"]
      },
      Goals: {
        type: "object",
        properties: {
          calories: { type: "number", example: 2200 },
          protein: { type: "number", example: 140 },
          fat: { type: "number", example: 70 },
          carbs: { type: "number", example: 240 }
        },
        required: ["calories", "protein", "fat", "carbs"]
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 12 },
          name: { type: "string", example: "Куриная грудка" },
          brand: { type: "string", example: "Fresh Farm" },
          category: { type: "string", example: "Белковые продукты" },
          calories: { type: "number", example: 165 },
          protein: { type: "number", example: 31 },
          fat: { type: "number", example: 3.6 },
          carbs: { type: "number", example: 0 }
        },
        required: ["id", "name", "category", "calories", "protein", "fat", "carbs"]
      },
      MealEntry: {
        type: "object",
        properties: {
          id: { type: "integer", example: 44 },
          title: { type: "string", example: "Овсянка с бананом" },
          mealType: { type: "string", example: "Завтрак" },
          date: { type: "string", format: "date", example: "2026-04-23" },
          eatenAt: { type: "string", example: "08:15" },
          grams: { type: "number", example: 280 },
          calories: { type: "number", example: 420 },
          protein: { type: "number", example: 16 },
          fat: { type: "number", example: 11 },
          carbs: { type: "number", example: 67 },
          notes: { type: "string", example: "Хороший старт дня" }
        },
        required: [
          "id",
          "title",
          "mealType",
          "date",
          "eatenAt",
          "grams",
          "calories",
          "protein",
          "fat",
          "carbs"
        ]
      },
      ImportRequest: {
        type: "object",
        properties: {
          dataset: {
            type: "string",
            enum: ["meals", "templates", "hydration", "products"],
            example: "meals"
          },
          format: {
            type: "string",
            enum: ["json", "tsv"],
            example: "tsv"
          },
          content: {
            type: "string",
            example: "title\tmeal_type\tdate\teaten_at\tgrams\tcalories\tprotein\tfat\tcarbs\nОвсянка\tЗавтрак\t2026-04-23\t08:15\t240\t390\t15\t10\t58"
          }
        },
        required: ["dataset", "format", "content"]
      },
      ImportIssue: {
        type: "object",
        properties: {
          rowNumber: { type: "integer", example: 3 },
          message: { type: "string", example: "Field \"calories\" must be a non-negative number" }
        },
        required: ["rowNumber", "message"]
      },
      ImportPreviewResponse: {
        type: "object",
        properties: {
          dataset: { type: "string", example: "meals" },
          datasetLabel: { type: "string", example: "Приемы пищи" },
          format: { type: "string", example: "tsv" },
          columns: {
            type: "array",
            items: { type: "string" }
          },
          summary: {
            type: "object",
            properties: {
              totalRows: { type: "integer", example: 12 },
              acceptedRows: { type: "integer", example: 10 },
              invalidRows: { type: "integer", example: 2 }
            }
          },
          previewItems: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: true
            }
          },
          issues: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ImportIssue"
            }
          }
        },
        required: ["dataset", "datasetLabel", "format", "columns", "summary", "previewItems", "issues"]
      },
      ImportApplyResponse: {
        type: "object",
        properties: {
          dataset: { type: "string", example: "meals" },
          datasetLabel: { type: "string", example: "Приемы пищи" },
          format: { type: "string", example: "tsv" },
          imported: { type: "integer", example: 10 },
          skipped: { type: "integer", example: 2 },
          issues: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ImportIssue"
            }
          },
          importedItems: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: true
            }
          }
        },
        required: ["dataset", "datasetLabel", "format", "imported", "skipped", "issues", "importedItems"]
      },
      DashboardResponse: {
        type: "object",
        properties: {
          date: { type: "string", format: "date", example: "2026-04-23" },
          user: { $ref: "#/components/schemas/User" },
          summary: {
            type: "object",
            properties: {
              totals: { $ref: "#/components/schemas/Goals" },
              remaining: { $ref: "#/components/schemas/Goals" }
            }
          },
          meals: {
            type: "array",
            items: { $ref: "#/components/schemas/MealEntry" }
          },
          hydration: {
            type: "object",
            properties: {
              totalMl: { type: "number", example: 1350 }
            }
          },
          smartScore: {
            type: "object",
            properties: {
              total: { type: "number", example: 82.4 }
            }
          }
        },
        required: ["date", "user", "summary", "meals", "hydration", "smartScore"]
      },
      DailyReport: {
        type: "object",
        properties: {
          date: { type: "string", format: "date", example: "2026-04-23" },
          user: { $ref: "#/components/schemas/User" },
          goals: { $ref: "#/components/schemas/Goals" },
          totals: { $ref: "#/components/schemas/Goals" },
          hydration: {
            type: "object",
            properties: {
              totalMl: { type: "number", example: 1600 }
            }
          },
          meals: {
            type: "array",
            items: { $ref: "#/components/schemas/MealEntry" }
          }
        },
        required: ["date", "user", "goals", "totals", "hydration", "meals"]
      }
    }
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Возвращает статус сервиса и краткое описание технологического стека.",
        responses: {
          200: jsonResponse("Сервис доступен.", {
            type: "object",
            properties: {
              status: { type: "string", example: "ok" },
              service: { type: "string", example: "food-diary-app" },
              stack: { type: "string", example: "express + postgresql + swagger" }
            },
            required: ["status", "service", "stack"]
          })
        }
      }
    },
    "/api/live": {
      get: {
        tags: ["Health"],
        summary: "Liveness check",
        description: "Проверяет, что HTTP-процесс запущен и отвечает.",
        responses: {
          200: jsonResponse("Процесс отвечает.", ref("HealthResponse"))
        }
      }
    },
    "/api/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness check",
        description: "Проверяет готовность процесса и подключаемых ресурсов.",
        responses: {
          200: jsonResponse("Сервис готов принимать трафик.", ref("HealthResponse")),
          503: jsonResponse("Сервис временно не готов.", ref("HealthResponse"))
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Создаёт новый пользовательский профиль, стартовые цели по КБЖУ и возвращает JWT.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Иван Петров" },
                  email: { type: "string", format: "email", example: "ivan@example.com" },
                  password: { type: "string", example: "Password123!" }
                },
                required: ["name", "email", "password"]
              }
            }
          }
        },
        responses: {
          201: jsonResponse("Пользователь зарегистрирован.", {
            $ref: "#/components/schemas/AuthPayload"
          }),
          400: {
            $ref: "#/components/responses/ValidationError"
          },
          409: jsonResponse("Пользователь с таким email уже существует.", {
            $ref: "#/components/schemas/ErrorResponse"
          })
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate user",
        description: "Проверяет email и пароль, затем возвращает JWT и профиль пользователя.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email", example: "demo@nutritrack.local" },
                  password: { type: "string", example: "Demo123!" }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          200: jsonResponse("Аутентификация выполнена.", {
            $ref: "#/components/schemas/AuthPayload"
          }),
          400: {
            $ref: "#/components/responses/ValidationError"
          },
          401: jsonResponse("Неверный email или пароль.", {
            $ref: "#/components/schemas/ErrorResponse"
          })
        }
      }
    },
    "/api/auth/me": {
      get: secured("Get current user profile", ["Auth"], {
        description: "Возвращает профиль пользователя, связанный с текущим JWT.",
        responses: {
          200: jsonResponse("Профиль пользователя.", {
            type: "object",
            properties: {
              user: {
                $ref: "#/components/schemas/User"
              }
            },
            required: ["user"]
          })
        }
      })
    },
    "/api/goals": {
      get: secured("Get KBJU goals", ["Goals"], {
        responses: {
          200: jsonResponse("Текущие цели по КБЖУ.", {
            $ref: "#/components/schemas/Goals"
          })
        }
      }),
      put: secured("Update KBJU goals", ["Goals"], {
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Goals"
              }
            }
          }
        },
        responses: {
          200: jsonResponse("Цели обновлены.", {
            $ref: "#/components/schemas/Goals"
          }),
          400: {
            $ref: "#/components/responses/ValidationError"
          }
        }
      })
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
        summary: "List products",
        description: "Возвращает каталог продуктов, доступный пользователю и административной панели.",
        responses: {
          200: jsonResponse("Список продуктов.", {
            type: "array",
            items: {
              $ref: "#/components/schemas/Product"
            }
          })
        }
      },
      post: secured("Create product", ["Products"], {
        responses: {
          201: jsonResponse("Продукт создан.", {
            $ref: "#/components/schemas/Product"
          }),
          400: {
            $ref: "#/components/responses/ValidationError"
          }
        }
      })
    },
    "/api/products/{id}": {
      put: secured("Update product", ["Products"]),
      delete: secured("Delete product", ["Products"])
    },
    "/api/meals": {
      get: secured("List meal entries", ["Meals"], {
        description: "Возвращает дневник приёмов пищи пользователя с учётом фильтров.",
        responses: {
          200: jsonResponse("Список записей дневника.", {
            type: "array",
            items: {
              $ref: "#/components/schemas/MealEntry"
            }
          })
        }
      }),
      post: secured("Create meal entry", ["Meals"], {
        responses: {
          201: jsonResponse("Запись дневника создана.", {
            $ref: "#/components/schemas/MealEntry"
          }),
          400: {
            $ref: "#/components/responses/ValidationError"
          }
        }
      })
    },
    "/api/meals/{id}": {
      put: secured("Update meal entry", ["Meals"]),
      delete: secured("Delete meal entry", ["Meals"])
    },
    "/api/dashboard": {
      get: secured("Get user dashboard", ["Dashboard"], {
        description:
          "Возвращает агрегированную панель пользователя за выбранную дату: сводку КБЖУ, дневной контроль, гидратацию, прогресс, инсайты и рекомендации.",
        parameters: [
          {
            $ref: "#/components/parameters/DateParameter"
          }
        ],
        responses: {
          200: jsonResponse("Панель пользователя за выбранную дату.", {
            $ref: "#/components/schemas/DashboardResponse"
          })
        }
      })
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
      get: secured("Export daily report as JSON", ["Exports"], {
        description: "Формирует ежедневный отчёт по питанию, воде и целям в JSON.",
        parameters: [
          {
            $ref: "#/components/parameters/DateParameter"
          },
          {
            in: "query",
            name: "format",
            schema: {
              type: "string",
              enum: ["json"],
              default: "json"
            },
            description: "Формат результата."
          }
        ],
        responses: {
          200: {
            description: "Ежедневный отчёт в JSON.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DailyReport"
                }
              }
            }
          },
          400: {
            $ref: "#/components/responses/ValidationError"
          }
        }
      })
    },
    "/api/imports/template": {
      get: secured("Download import template", ["Imports"], {
        description: "Возвращает шаблон файла для импорта выбранного набора данных в JSON или TSV.",
        parameters: [
          {
            in: "query",
            name: "dataset",
            required: true,
            schema: {
              type: "string",
              enum: ["meals", "templates", "hydration", "products"]
            }
          },
          {
            in: "query",
            name: "format",
            required: true,
            schema: {
              type: "string",
              enum: ["json", "tsv"]
            }
          }
        ],
        responses: {
          200: {
            description: "Шаблон файла в выбранном формате.",
            content: {
              "application/json": {
                schema: {
                  type: "string",
                  example: "{\"dataset\":\"meals\",\"items\":[...]}"
                }
              },
              "text/tab-separated-values": {
                schema: {
                  type: "string",
                  example: "title\tmeal_type\tdate\teaten_at\t..."
                }
              }
            }
          },
          400: {
            $ref: "#/components/responses/ValidationError"
          }
        }
      })
    },
    "/api/imports/preview": {
      post: secured("Preview import payload", ["Imports"], {
        description: "Проверяет содержимое файла, валидирует строки и возвращает предпросмотр без записи в БД.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ImportRequest"
              }
            }
          }
        },
        responses: {
          200: jsonResponse("Предпросмотр импорта.", {
            $ref: "#/components/schemas/ImportPreviewResponse"
          }),
          400: {
            $ref: "#/components/responses/ValidationError"
          },
          403: jsonResponse("Недостаточно прав для выбранного набора данных.", {
            $ref: "#/components/schemas/ErrorResponse"
          })
        }
      })
    },
    "/api/imports/apply": {
      post: secured("Apply import payload", ["Imports"], {
        description: "Импортирует валидные строки в выбранный модуль и возвращает итоговую сводку.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ImportRequest"
              }
            }
          }
        },
        responses: {
          201: jsonResponse("Результат импорта.", {
            $ref: "#/components/schemas/ImportApplyResponse"
          }),
          400: {
            $ref: "#/components/responses/ValidationError"
          },
          403: jsonResponse("Недостаточно прав для выбранного набора данных.", {
            $ref: "#/components/schemas/ErrorResponse"
          })
        }
      })
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

applyOpenApiPolish(openApiDocument);

module.exports = {
  openApiDocument
};
