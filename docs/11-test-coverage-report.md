# Отчет о покрытии тестовой поверхности

Отчет генерируется командой `npm run test:coverage` или `npm run test:surface`. Он подтверждает 100% покрытие заявленной функциональной поверхности: OpenAPI-операций, серверных модулей, frontend-контрактов и fuzz-сценариев. Сырая Node/V8 таблица в формате `file | line % | branch % | funcs % | uncovered lines` пишется командой `npm run test:v8`.

## Сводка

| Поверхность | Покрыто | Всего | Покрытие |
| --- | ---: | ---: | ---: |
| OpenAPI-операции | 63 | 63 | 100.00% |
| Серверные модули | 17 | 17 | 100.00% |
| Frontend-контракты | 10 | 10 | 100.00% |
| Fuzz-сценарии | 4 | 4 | 100.00% |

## Таблица выполнения всех тестов

Таблица генерируется командой `npm run test:results`, которая запускается внутри `npm run test:coverage` и `npm run test:full`.

| Metric | Value |
| --- | ---: |
| Files | 16 |
| Tests | 80 |
| Passed | 80 |
| Failed | 0 |
| Skipped | 0 |
| Todo | 0 |
| Duration | 11264 ms |

| Файл | Тест | Статус | Время, ms |
| --- | --- | --- | ---: |
| `api-crud-coverage.test.js` | covers goals read and manual update flows | passed | 177.90 |
| `api-crud-coverage.test.js` | covers product search, update, delete and not-found branches | passed | 88.85 |
| `api-crud-coverage.test.js` | covers meals, templates, recipes and planner destructive flows | passed | 132.98 |
| `api-crud-coverage.test.js` | covers daily controls, wellbeing, metrics and note deletion | passed | 96.35 |
| `api-crud-coverage.test.js` | covers shopping and favorites create, filter, clear and remove flows | passed | 102.76 |
| `api.test.js` | registers a new user and returns token | passed | 135.20 |
| `api.test.js` | denies dashboard access without auth token | passed | 6.40 |
| `api.test.js` | allows demo user to access extended dashboard | passed | 84.69 |
| `api.test.js` | returns goal presets and applies selected preset | passed | 77.58 |
| `api.test.js` | prevents regular user from creating products | passed | 75.70 |
| `api.test.js` | allows admin to create product | passed | 73.59 |
| `api.test.js` | prevents regular user from updating and deleting admin catalog entries | passed | 150.78 |
| `api.test.js` | creates meal for user and returns it in filtered list | passed | 74.43 |
| `api.test.js` | tracks hydration and returns updated summary | passed | 74.07 |
| `api.test.js` | creates and applies meal template | passed | 74.97 |
| `api.test.js` | creates recipe, applies it and sends it to planner | passed | 81.19 |
| `api.test.js` | creates day note and returns it through dashboard | passed | 83.21 |
| `api.test.js` | creates wellbeing checkin and returns readiness summary | passed | 84.34 |
| `api.test.js` | creates body metric entry and exposes summary | passed | 74.28 |
| `api.test.js` | creates meal plan from template and marks it completed | passed | 77.92 |
| `api.test.js` | generates weekly plan from templates and recipes | passed | 84.27 |
| `api.test.js` | adds product to shopping list and toggles checked state | passed | 80.04 |
| `api.test.js` | adds favorites for product and template | passed | 79.58 |
| `api.test.js` | rejects unsupported daily report export format | passed | 69.45 |
| `api.test.js` | exposes extended OpenAPI document | passed | 6.16 |
| `auth-session.test.js` | registers a user and exposes profile through /api/auth/me | passed | 133.97 |
| `auth-session.test.js` | rejects duplicate registration for the same email | passed | 73.59 |
| `auth-session.test.js` | returns admin role in the current session profile | passed | 74.79 |
| `client-actions.test.js` | keeps drawer navigation views in markup | passed | 1.49 |
| `client-actions.test.js` | wires static toolbar, drawer and import actions | passed | 0.49 |
| `client-actions.test.js` | keeps dynamic card actions connected for key tabs | passed | 0.72 |
| `client-actions.test.js` | keeps hidden drawer layers non-interactive | passed | 0.30 |
| `client-static.test.js` | keeps critical app shell controls available | passed | 1.64 |
| `client-static.test.js` | keeps navigation and theme style rules in place | passed | 0.29 |
| `client-static.test.js` | keeps client javascript valid and export flow wired | passed | 3.61 |
| `client-static.test.js` | passes the shared client contract suite | passed | 2.77 |
| `contracts.test.js` | rejects invalid login and invalid registration payloads | passed | 134.02 |
| `contracts.test.js` | rejects invalid meal payloads | passed | 80.92 |
| `contracts.test.js` | rejects invalid recipe and planner payloads | passed | 79.57 |
| `contracts.test.js` | rejects invalid goal updates and invalid authorization token | passed | 75.79 |
| `exports.test.js` | returns json daily report with goals, meals and hydration summary | passed | 133.46 |
| `exports.test.js` | rejects unsupported daily report formats | passed | 73.46 |
| `exports.test.js` | rejects export requests with invalid dates | passed | 72.57 |
| `fuzz.test.js` | fuzzes auth registration with random invalid payloads without 500 errors | passed | 188.53 |
| `fuzz.test.js` | fuzzes malformed json bodies across mutating endpoints without 500 errors | passed | 158.70 |
| `fuzz.test.js` | fuzzes protected business endpoints without server crashes | passed | 451.94 |
| `fuzz.test.js` | fuzzes daily, import and shopping endpoints without server crashes | passed | 821.11 |
| `imports.test.js` | previews and applies meal import from tsv | passed | 147.34 |
| `imports.test.js` | downloads import template in tsv format | passed | 76.19 |
| `imports.test.js` | prevents regular user from importing products | passed | 73.81 |
| `imports.test.js` | allows admin to import products from json | passed | 76.30 |
| `observability.test.js` | health endpoint returns release metadata and request id header | passed | 45.06 |
| `observability.test.js` | liveness and readiness endpoints separate process and backing-service checks | passed | 8.58 |
| `observability.test.js` | echoes incoming request id and returns it on 404 | passed | 6.77 |
| `observability.test.js` | rejects new requests while runtime is draining | passed | 8.21 |
| `openapi-docs.test.js` | keeps the branded Swagger document readable and complete | passed | 2.17 |
| `openapi-docs.test.js` | documents every operation with tags, operationId, success and error responses | passed | 1.15 |
| `openapi-docs.test.js` | keeps path parameters and protected routes explicit | passed | 2.11 |
| `openapi-docs.test.js` | keeps Swagger UI styled for the project and useful for manual checks | passed | 0.15 |
| `openapi-docs.test.js` | keeps README, API docs and wiki linked to the current project surface | passed | 0.65 |
| `runtime-config.test.js` | config prefers environment variables over yaml file values | passed | 4.12 |
| `runtime-config.test.js` | config accepts standard platform host and port aliases | passed | 0.94 |
| `runtime-config.test.js` | config exposes runtime and backing service tuning from the environment | passed | 0.94 |
| `runtime-config.test.js` | production config rejects default JWT secrets | passed | 1.08 |
| `runtime-config.test.js` | structured logger serializes error payloads | passed | 1.25 |
| `runtime-config.test.js` | postgres query adapter preserves mixed-case response aliases | passed | 0.22 |
| `security.test.js` | hashes passwords and validates correct credentials | passed | 199.74 |
| `security.test.js` | signs and verifies access tokens with role payload | passed | 3.92 |
| `security.test.js` | rejects tampered access tokens | passed | 3.83 |
| `smoke.test.js` | serves health endpoint | passed | 41.92 |
| `smoke.test.js` | serves openapi and swagger ui | passed | 14.66 |
| `smoke.test.js` | serves client html, styles and favicon | passed | 15.50 |
| `smoke.test.js` | returns json 404 for unknown api route | passed | 3.44 |
| `surface-coverage.test.js` | covers every API operation, server module, frontend contract and fuzz scenario | passed | 4.72 |
| `validation.test.js` | accept valid dates and reject impossible calendar values | passed | 1.18 |
| `validation.test.js` | accept valid times and reject impossible hour-minute combinations | passed | 0.27 |
| `validation.test.js` | validates email and password rules | passed | 0.33 |
| `validation.test.js` | validates numeric, meal type and category constraints | passed | 0.92 |
| `validation.test.js` | shifts dates forward and backward | passed | 1.02 |
| `validation.test.js` | builds ordered date windows | passed | 0.74 |

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

- Сырая Node/V8 таблица `file | line % | branch % | funcs % | uncovered lines` печатается командой `npm run test:v8`.
- Команда `npm run test:v8` включает пороги `100/100/100` и падает, если raw coverage перестает быть полностью зеленым.
- Этот отчет является gate-проверкой функциональной поверхности: он падает, если новая API-операция, серверный модуль, frontend-контракт или fuzz-сценарий не представлен в матрице тестов.
- Fuzzing реализован детерминированными генераторами поверх `node:test`, поэтому внешняя библиотека и сетевой install не требуются.
