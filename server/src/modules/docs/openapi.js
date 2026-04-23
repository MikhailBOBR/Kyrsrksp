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

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Рацион API",
    version: "1.5.0-rc.1",
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
    { name: "Exports", description: "Экспорт ежедневного отчёта в JSON и CSV." },
    { name: "Imports", description: "Предпросмотр, шаблоны и импорт данных из JSON, CSV и TSV." },
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
            enum: ["json", "csv", "tsv"],
            example: "csv"
          },
          content: {
            type: "string",
            example: "title,meal_type,date,eaten_at,grams,calories,protein,fat,carbs\nОвсянка,Завтрак,2026-04-23,08:15,240,390,15,10,58"
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
          format: { type: "string", example: "csv" },
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
          format: { type: "string", example: "csv" },
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
              stack: { type: "string", example: "express + sqlite + swagger" }
            },
            required: ["status", "service", "stack"]
          })
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
      get: secured("Export daily report as JSON or CSV", ["Exports"], {
        description: "Формирует ежедневный отчёт по питанию, воде и целям в JSON или CSV.",
        parameters: [
          {
            $ref: "#/components/parameters/DateParameter"
          },
          {
            in: "query",
            name: "format",
            schema: {
              type: "string",
              enum: ["json", "csv"],
              default: "json"
            },
            description: "Формат результата."
          }
        ],
        responses: {
          200: {
            description: "Ежедневный отчёт в выбранном формате.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DailyReport"
                }
              },
              "text/csv": {
                schema: {
                  type: "string",
                  example: "nutrition_report,..."
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
        description: "Возвращает шаблон файла для импорта выбранного набора данных в JSON, CSV или TSV.",
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
              enum: ["json", "csv", "tsv"]
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
              "text/csv": {
                schema: {
                  type: "string",
                  example: "title,meal_type,date,eaten_at,..."
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

module.exports = {
  openApiDocument
};
