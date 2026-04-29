# Отчет о покрытии тестовой поверхности

Отчет генерируется командой `npm run test:surface`. Он подтверждает 100% покрытие заявленной функциональной поверхности: OpenAPI-операций, серверных модулей, frontend-контрактов и fuzz-сценариев.

## Сводка

| Поверхность | Покрыто | Всего | Покрытие |
| --- | ---: | ---: | ---: |
| OpenAPI-операции | 63 | 63 | 100.00% |
| Серверные модули | 17 | 17 | 100.00% |
| Frontend-контракты | 10 | 10 | 100.00% |
| Fuzz-сценарии | 4 | 4 | 100.00% |

## Матрица API-операций

| Метод | Path | operationId | Покрыто тестами |
| --- | --- | --- | --- |
| GET | `/api/health` | `getHealth` | smoke.test.js, observability.test.js |
| GET | `/api/live` | `getLive` | observability.test.js |
| GET | `/api/ready` | `getReady` | observability.test.js |
| POST | `/api/auth/register` | `postAuthRegister` | api.test.js, auth-session.test.js, fuzz.test.js |
| POST | `/api/auth/login` | `postAuthLogin` | api.test.js, auth-session.test.js, contracts.test.js, fuzz.test.js |
| GET | `/api/auth/me` | `getAuthMe` | auth-session.test.js |
| GET | `/api/goals` | `getGoals` | api-crud-coverage.test.js |
| PUT | `/api/goals` | `putGoals` | api-crud-coverage.test.js, contracts.test.js, fuzz.test.js |
| GET | `/api/goals/presets` | `getGoalsPresets` | api.test.js |
| POST | `/api/goals/presets/{presetId}/apply` | `postGoalsPresetsPresetIdApply` | api.test.js |
| GET | `/api/products` | `getProducts` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| POST | `/api/products` | `postProducts` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| PUT | `/api/products/{id}` | `putProductsId` | api.test.js, api-crud-coverage.test.js |
| DELETE | `/api/products/{id}` | `deleteProductsId` | api-crud-coverage.test.js |
| GET | `/api/meals` | `getMeals` | api.test.js |
| POST | `/api/meals` | `postMeals` | api.test.js, api-crud-coverage.test.js, contracts.test.js, fuzz.test.js |
| PUT | `/api/meals/{id}` | `putMealsId` | api-crud-coverage.test.js |
| DELETE | `/api/meals/{id}` | `deleteMealsId` | api-crud-coverage.test.js |
| GET | `/api/dashboard` | `getDashboard` | api.test.js, contracts.test.js, fuzz.test.js |
| GET | `/api/hydration` | `getHydration` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| POST | `/api/hydration` | `postHydration` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| DELETE | `/api/hydration/{id}` | `deleteHydrationId` | api-crud-coverage.test.js |
| GET | `/api/templates` | `getTemplates` | api.test.js, api-crud-coverage.test.js |
| POST | `/api/templates` | `postTemplates` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| POST | `/api/templates/from-meal/{mealId}` | `postTemplatesFromMealMealId` | api-crud-coverage.test.js |
| POST | `/api/templates/{id}/apply` | `postTemplatesIdApply` | api.test.js, api-crud-coverage.test.js |
| DELETE | `/api/templates/{id}` | `deleteTemplatesId` | api-crud-coverage.test.js |
| GET | `/api/recipes` | `getRecipes` | api-crud-coverage.test.js |
| POST | `/api/recipes` | `postRecipes` | api.test.js, api-crud-coverage.test.js, contracts.test.js, fuzz.test.js |
| POST | `/api/recipes/{id}/apply` | `postRecipesIdApply` | api.test.js |
| POST | `/api/recipes/{id}/plan` | `postRecipesIdPlan` | api.test.js |
| DELETE | `/api/recipes/{id}` | `deleteRecipesId` | api-crud-coverage.test.js |
| GET | `/api/exports/daily-report` | `getExportsDailyReport` | exports.test.js, api.test.js |
| GET | `/api/imports/template` | `getImportsTemplate` | imports.test.js |
| POST | `/api/imports/preview` | `postImportsPreview` | imports.test.js, fuzz.test.js |
| POST | `/api/imports/apply` | `postImportsApply` | imports.test.js, fuzz.test.js |
| GET | `/api/checkins` | `getCheckins` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| PUT | `/api/checkins` | `putCheckins` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| DELETE | `/api/checkins` | `deleteCheckins` | api-crud-coverage.test.js |
| GET | `/api/metrics` | `getMetrics` | api.test.js |
| POST | `/api/metrics` | `postMetrics` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| DELETE | `/api/metrics/{id}` | `deleteMetricsId` | api-crud-coverage.test.js |
| GET | `/api/planner` | `getPlanner` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| POST | `/api/planner` | `postPlanner` | api-crud-coverage.test.js, fuzz.test.js |
| POST | `/api/planner/from-template/{templateId}` | `postPlannerFromTemplateTemplateId` | api.test.js |
| POST | `/api/planner/generate-week` | `postPlannerGenerateWeek` | api.test.js, contracts.test.js, fuzz.test.js |
| PATCH | `/api/planner/{id}/completion` | `patchPlannerIdCompletion` | api.test.js, api-crud-coverage.test.js |
| DELETE | `/api/planner/{id}` | `deletePlannerId` | api-crud-coverage.test.js |
| GET | `/api/shopping` | `getShopping` | api.test.js, api-crud-coverage.test.js |
| POST | `/api/shopping` | `postShopping` | api-crud-coverage.test.js, fuzz.test.js |
| POST | `/api/shopping/from-product/{productId}` | `postShoppingFromProductProductId` | api.test.js, api-crud-coverage.test.js |
| PATCH | `/api/shopping/{id}/check` | `patchShoppingIdCheck` | api.test.js, api-crud-coverage.test.js |
| DELETE | `/api/shopping/checked` | `deleteShoppingChecked` | api-crud-coverage.test.js |
| DELETE | `/api/shopping/{id}` | `deleteShoppingId` | api-crud-coverage.test.js |
| GET | `/api/day-notes` | `getDayNotes` | api-crud-coverage.test.js, fuzz.test.js |
| PUT | `/api/day-notes` | `putDayNotes` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| DELETE | `/api/day-notes` | `deleteDayNotes` | api-crud-coverage.test.js |
| GET | `/api/day-notes/recent` | `getDayNotesRecent` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| GET | `/api/favorites` | `getFavorites` | api.test.js |
| POST | `/api/favorites/products/{productId}` | `postFavoritesProductsProductId` | api.test.js, api-crud-coverage.test.js |
| DELETE | `/api/favorites/products/{productId}` | `deleteFavoritesProductsProductId` | api-crud-coverage.test.js |
| POST | `/api/favorites/templates/{templateId}` | `postFavoritesTemplatesTemplateId` | api.test.js, api-crud-coverage.test.js |
| DELETE | `/api/favorites/templates/{templateId}` | `deleteFavoritesTemplatesTemplateId` | api-crud-coverage.test.js |

## Матрица серверных модулей

| Модуль | Покрыто тестами |
| --- | --- |
| `auth` | api.test.js, auth-session.test.js, contracts.test.js, fuzz.test.js |
| `checkins` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| `dashboard` | api.test.js, fuzz.test.js |
| `day-notes` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| `docs` | openapi-docs.test.js, smoke.test.js |
| `exports` | exports.test.js, api.test.js |
| `favorites` | api.test.js, api-crud-coverage.test.js |
| `goals` | api.test.js, api-crud-coverage.test.js, contracts.test.js |
| `hydration` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| `imports` | imports.test.js, fuzz.test.js |
| `meals` | api.test.js, api-crud-coverage.test.js, contracts.test.js, fuzz.test.js |
| `metrics` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| `planner` | api.test.js, api-crud-coverage.test.js, contracts.test.js, fuzz.test.js |
| `products` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| `recipes` | api.test.js, api-crud-coverage.test.js, contracts.test.js, fuzz.test.js |
| `shopping` | api.test.js, api-crud-coverage.test.js, fuzz.test.js |
| `templates` | api.test.js, api-crud-coverage.test.js |

## Матрица frontend-контрактов

| Контракт | Статус |
| --- | --- |
| auth forms and session controls | covered |
| sidebar navigation covers every workspace view | covered |
| dashboard and visualization widgets | covered |
| daily forms | covered |
| planning, recipes and templates forms | covered |
| catalog, shopping and favorites interactions | covered |
| import and export panel | covered |
| responsive shell and dark theme | covered |
| printable PDF report path | covered |
| client javascript syntax and safety contracts | covered |

## Матрица fuzz-тестов

| Сценарий | Статус |
| --- | --- |
| auth registration random invalid payloads | covered |
| malformed JSON bodies across mutating endpoints | covered |
| protected business endpoints random payloads | covered |
| daily, import and shopping random payloads | covered |

## Примечания

- Line/branch coverage отдельно показывает `npm run test:coverage` через Node/V8.
- Этот отчет является gate-проверкой функциональной поверхности: он падает, если новая API-операция, серверный модуль, frontend-контракт или fuzz-сценарий не представлен в матрице тестов.
- Fuzzing реализован детерминированными генераторами поверх `node:test`, поэтому внешняя библиотека и сетевой install не требуются.
