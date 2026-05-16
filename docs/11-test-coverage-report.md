# Отчет о покрытии тестовой поверхности

Отчет генерируется командой `npm run test:coverage` или `npm run test:surface`. Он подтверждает 100% покрытие заявленной функциональной поверхности: OpenAPI-операций, серверных модулей, frontend-контрактов и fuzz-сценариев. Сырая Node/V8 таблица в формате `file | line % | branch % | funcs % | uncovered lines` пишется командой `npm run test:v8`.

## Сводка

| Поверхность | Покрыто | Всего | Покрытие |
| --- | ---: | ---: | ---: |
| OpenAPI-операции | 65 | 65 | 100.00% |
| Серверные модули | 18 | 18 | 100.00% |
| Frontend-контракты | 10 | 10 | 100.00% |
| Fuzz-сценарии | 5 | 5 | 100.00% |

## Таблица выполнения всех тестов

Таблица генерируется командой `npm run test:results`, которая запускается внутри `npm run test:coverage` и `npm run test:full`.

| Metric | Value |
| --- | ---: |
| Files | 17 |
| Tests | 184 |
| Passed | 184 |
| Failed | 0 |
| Skipped | 0 |
| Todo | 0 |
| Duration | 30571 ms |

| Файл | Тест | Статус | Время, ms |
| --- | --- | --- | ---: |
| `api-crud-coverage.test.js` | covers goals read and manual update flows | passed | 356.75 |
| `api-crud-coverage.test.js` | covers product search, update, delete and not-found branches | passed | 270.97 |
| `api-crud-coverage.test.js` | covers meals, templates, recipes and planner destructive flows | passed | 300.21 |
| `api-crud-coverage.test.js` | covers daily controls, wellbeing, metrics and note deletion | passed | 219.39 |
| `api-crud-coverage.test.js` | covers shopping and favorites create, filter, clear and remove flows | passed | 262.87 |
| `api.test.js` | registers a new user and returns token | passed | 368.67 |
| `api.test.js` | denies dashboard access without auth token | passed | 17.34 |
| `api.test.js` | allows demo user to access extended dashboard | passed | 247.66 |
| `api.test.js` | returns goal presets and applies selected preset | passed | 181.12 |
| `api.test.js` | prevents regular user from creating products | passed | 186.26 |
| `api.test.js` | allows admin to create product | passed | 231.35 |
| `api.test.js` | prevents regular user from updating and deleting admin catalog entries | passed | 346.52 |
| `api.test.js` | creates meal for user and returns it in filtered list | passed | 181.67 |
| `api.test.js` | tracks hydration and returns updated summary | passed | 185.44 |
| `api.test.js` | creates and applies meal template | passed | 185.07 |
| `api.test.js` | creates recipe, applies it and sends it to planner | passed | 185.01 |
| `api.test.js` | creates day note and returns it through dashboard | passed | 193.48 |
| `api.test.js` | creates wellbeing checkin and returns readiness summary | passed | 186.84 |
| `api.test.js` | creates body metric entry and exposes summary | passed | 163.29 |
| `api.test.js` | creates meal plan from template and marks it completed | passed | 179.23 |
| `api.test.js` | generates weekly plan from templates and recipes | passed | 201.37 |
| `api.test.js` | adds product to shopping list and toggles checked state | passed | 182.59 |
| `api.test.js` | adds favorites for product and template | passed | 191.15 |
| `api.test.js` | rejects unsupported daily report export format | passed | 165.77 |
| `api.test.js` | exposes extended OpenAPI document | passed | 8.88 |
| `auth-session.test.js` | registers a user and exposes profile through /api/auth/me | passed | 427.07 |
| `auth-session.test.js` | rejects duplicate registration for the same email | passed | 232.53 |
| `auth-session.test.js` | returns admin role in the current session profile | passed | 212.81 |
| `client-actions.test.js` | keeps drawer navigation views in markup | passed | 3.43 |
| `client-actions.test.js` | wires static toolbar, drawer and import actions | passed | 1.19 |
| `client-actions.test.js` | keeps dynamic card actions connected for key tabs | passed | 1.73 |
| `client-actions.test.js` | keeps hidden drawer layers non-interactive | passed | 0.64 |
| `client-static.test.js` | keeps critical app shell controls available | passed | 4.12 |
| `client-static.test.js` | keeps navigation and theme style rules in place | passed | 0.56 |
| `client-static.test.js` | keeps client javascript valid and export flow wired | passed | 8.00 |
| `client-static.test.js` | passes the shared client contract suite | passed | 5.98 |
| `contracts.test.js` | rejects invalid login and invalid registration payloads | passed | 310.61 |
| `contracts.test.js` | rejects invalid meal payloads | passed | 227.41 |
| `contracts.test.js` | rejects invalid recipe and planner payloads | passed | 251.73 |
| `contracts.test.js` | rejects invalid goal updates and invalid authorization token | passed | 213.36 |
| `exports.test.js` | returns json daily report with goals, meals and hydration summary | passed | 327.35 |
| `exports.test.js` | rejects unsupported daily report formats | passed | 179.56 |
| `exports.test.js` | rejects export requests with invalid dates | passed | 173.77 |
| `fuzz.test.js` | fuzzes auth registration with random invalid payloads without 500 errors | passed | 499.59 |
| `fuzz.test.js` | fuzzes malformed json bodies across mutating endpoints without 500 errors | passed | 462.59 |
| `fuzz.test.js` | fuzzes protected business endpoints without server crashes | passed | 1229.92 |
| `fuzz.test.js` | fuzzes daily, import and shopping endpoints without server crashes | passed | 1882.49 |
| `fuzz.test.js` | 001 query dashboard date 1 | passed | 22.21 |
| `fuzz.test.js` | 002 query hydration date 2 | passed | 4.61 |
| `fuzz.test.js` | 003 query meals filters 3 | passed | 7.72 |
| `fuzz.test.js` | 004 query planner date 4 | passed | 7.36 |
| `fuzz.test.js` | 005 query day notes date 5 | passed | 4.81 |
| `fuzz.test.js` | 006 query recent day notes limit 6 | passed | 6.04 |
| `fuzz.test.js` | 007 query products filters 7 | passed | 2.93 |
| `fuzz.test.js` | 008 query daily report query 8 | passed | 5.13 |
| `fuzz.test.js` | 009 query import template query 9 | passed | 4.82 |
| `fuzz.test.js` | 010 query admin users query 10 | passed | 5.04 |
| `fuzz.test.js` | 011 query dashboard date 11 | passed | 5.23 |
| `fuzz.test.js` | 012 query hydration date 12 | passed | 6.32 |
| `fuzz.test.js` | 013 query meals filters 13 | passed | 4.66 |
| `fuzz.test.js` | 014 query planner date 14 | passed | 5.02 |
| `fuzz.test.js` | 015 query day notes date 15 | passed | 5.09 |
| `fuzz.test.js` | 016 query recent day notes limit 16 | passed | 18.45 |
| `fuzz.test.js` | 017 query products filters 17 | passed | 3.42 |
| `fuzz.test.js` | 018 query daily report query 18 | passed | 4.84 |
| `fuzz.test.js` | 019 query import template query 19 | passed | 4.73 |
| `fuzz.test.js` | 020 query admin users query 20 | passed | 4.24 |
| `fuzz.test.js` | 021 auth me without token | passed | 3.36 |
| `fuzz.test.js` | 022 auth me invalid token | passed | 3.45 |
| `fuzz.test.js` | 023 login empty object | passed | 3.28 |
| `fuzz.test.js` | 024 login null body | passed | 4.16 |
| `fuzz.test.js` | 025 login array body | passed | 3.30 |
| `fuzz.test.js` | 026 login long fields | passed | 3.33 |
| `fuzz.test.js` | 027 register primitive body | passed | 4.37 |
| `fuzz.test.js` | 028 register duplicate-like body | passed | 3.55 |
| `fuzz.test.js` | 029 admin route user token | passed | 5.01 |
| `fuzz.test.js` | 030 admin role invalid token | passed | 3.94 |
| `fuzz.test.js` | 031 body shape empty object PUT /api/goals | passed | 5.22 |
| `fuzz.test.js` | 032 body shape null POST /api/meals | passed | 4.89 |
| `fuzz.test.js` | 033 body shape array POST /api/templates | passed | 3.43 |
| `fuzz.test.js` | 034 body shape string POST /api/recipes | passed | 5.08 |
| `fuzz.test.js` | 035 body shape number POST /api/planner | passed | 5.19 |
| `fuzz.test.js` | 036 body shape boolean POST /api/planner/generate-week | passed | 4.01 |
| `fuzz.test.js` | 037 body shape oversized fields POST /api/hydration | passed | 6.06 |
| `fuzz.test.js` | 038 body shape nested object PUT /api/checkins | passed | 4.84 |
| `fuzz.test.js` | 039 body shape empty object POST /api/metrics | passed | 5.70 |
| `fuzz.test.js` | 040 body shape null PUT /api/day-notes | passed | 3.38 |
| `fuzz.test.js` | 041 body shape array POST /api/shopping | passed | 5.56 |
| `fuzz.test.js` | 042 body shape string POST /api/imports/preview | passed | 4.63 |
| `fuzz.test.js` | 043 body shape number POST /api/imports/apply | passed | 4.59 |
| `fuzz.test.js` | 044 body shape boolean POST /api/products | passed | 4.69 |
| `fuzz.test.js` | 045 body shape oversized fields PATCH /api/users/1/role | passed | 7.54 |
| `fuzz.test.js` | 046 body shape nested object PUT /api/goals | passed | 5.18 |
| `fuzz.test.js` | 047 body shape empty object POST /api/meals | passed | 7.05 |
| `fuzz.test.js` | 048 body shape null POST /api/templates | passed | 3.30 |
| `fuzz.test.js` | 049 body shape array POST /api/recipes | passed | 4.47 |
| `fuzz.test.js` | 050 body shape string POST /api/planner | passed | 3.63 |
| `fuzz.test.js` | 051 body shape number POST /api/planner/generate-week | passed | 3.03 |
| `fuzz.test.js` | 052 body shape boolean POST /api/hydration | passed | 4.84 |
| `fuzz.test.js` | 053 body shape oversized fields PUT /api/checkins | passed | 5.56 |
| `fuzz.test.js` | 054 body shape nested object POST /api/metrics | passed | 9.37 |
| `fuzz.test.js` | 055 body shape empty object PUT /api/day-notes | passed | 6.42 |
| `fuzz.test.js` | 056 body shape null POST /api/shopping | passed | 3.87 |
| `fuzz.test.js` | 057 body shape array POST /api/imports/preview | passed | 4.88 |
| `fuzz.test.js` | 058 body shape string POST /api/imports/apply | passed | 3.69 |
| `fuzz.test.js` | 059 body shape number POST /api/products | passed | 3.52 |
| `fuzz.test.js` | 060 body shape boolean PATCH /api/users/1/role | passed | 6.11 |
| `fuzz.test.js` | 061 path id 0 PUT /api/meals/:id | passed | 6.16 |
| `fuzz.test.js` | 062 path id -1 DELETE /api/meals/:id | passed | 6.74 |
| `fuzz.test.js` | 063 path id abc POST /api/templates/from-meal/:id | passed | 9.74 |
| `fuzz.test.js` | 064 path id 1.5 POST /api/templates/:id/apply | passed | 7.19 |
| `fuzz.test.js` | 065 path id 999999 DELETE /api/templates/:id | passed | 4.88 |
| `fuzz.test.js` | 066 path id NaN POST /api/recipes/:id/apply | passed | 5.15 |
| `fuzz.test.js` | 067 path id Infinity POST /api/recipes/:id/plan | passed | 5.43 |
| `fuzz.test.js` | 068 path id ..%2F1 DELETE /api/recipes/:id | passed | 4.36 |
| `fuzz.test.js` | 069 path id %20 POST /api/planner/from-template/:id | passed | 5.47 |
| `fuzz.test.js` | 070 path id 00000000000000000001 PATCH /api/planner/:id/completion | passed | 5.17 |
| `fuzz.test.js` | 071 path id 0 DELETE /api/planner/:id | passed | 5.07 |
| `fuzz.test.js` | 072 path id -1 DELETE /api/hydration/:id | passed | 4.81 |
| `fuzz.test.js` | 073 path id abc DELETE /api/metrics/:id | passed | 5.65 |
| `fuzz.test.js` | 074 path id 1.5 POST /api/shopping/from-product/:id | passed | 5.44 |
| `fuzz.test.js` | 075 path id 999999 PATCH /api/shopping/:id/check | passed | 6.83 |
| `fuzz.test.js` | 076 path id NaN DELETE /api/shopping/:id | passed | 9.43 |
| `fuzz.test.js` | 077 path id Infinity POST /api/favorites/products/:id | passed | 9.26 |
| `fuzz.test.js` | 078 path id ..%2F1 DELETE /api/favorites/products/:id | passed | 9.23 |
| `fuzz.test.js` | 079 path id %20 POST /api/favorites/templates/:id | passed | 6.87 |
| `fuzz.test.js` | 080 path id 00000000000000000001 DELETE /api/favorites/templates/:id | passed | 20.58 |
| `fuzz.test.js` | 081 path id 0 PUT /api/products/:id | passed | 7.03 |
| `fuzz.test.js` | 082 path id -1 DELETE /api/products/:id | passed | 15.55 |
| `fuzz.test.js` | 083 path id abc PATCH /api/users/:id/role | passed | 5.80 |
| `fuzz.test.js` | 084 path id 1.5 PUT /api/meals/:id | passed | 4.93 |
| `fuzz.test.js` | 085 path id 999999 DELETE /api/meals/:id | passed | 4.29 |
| `fuzz.test.js` | 086 media text plain POST /api/meals | passed | 5.01 |
| `fuzz.test.js` | 087 media json string POST /api/templates | passed | 3.05 |
| `fuzz.test.js` | 088 media json null POST /api/recipes | passed | 3.74 |
| `fuzz.test.js` | 089 media json array POST /api/planner | passed | 3.49 |
| `fuzz.test.js` | 090 media urlencoded POST /api/hydration | passed | 7.95 |
| `fuzz.test.js` | 091 media missing content type PUT /api/checkins | passed | 5.27 |
| `fuzz.test.js` | 092 media deep object POST /api/metrics | passed | 4.97 |
| `fuzz.test.js` | 093 media empty body json header PUT /api/day-notes | passed | 5.04 |
| `fuzz.test.js` | 094 media text plain POST /api/shopping | passed | 4.77 |
| `fuzz.test.js` | 095 media json string POST /api/imports/preview | passed | 3.89 |
| `fuzz.test.js` | 096 media json null POST /api/products | passed | 3.44 |
| `fuzz.test.js` | 097 media json array PATCH /api/planner/999999/completion | passed | 4.01 |
| `fuzz.test.js` | 098 media urlencoded PATCH /api/shopping/999999/check | passed | 7.76 |
| `fuzz.test.js` | 099 media missing content type PATCH /api/users/999999/role | passed | 6.79 |
| `fuzz.test.js` | 100 media deep object DELETE /api/shopping/999999 | passed | 10.09 |
| `fuzz.test.js` | fuzzes 100 adversarial API shapes without server crashes | passed | 904.82 |
| `imports.test.js` | previews and applies meal import from tsv | passed | 376.66 |
| `imports.test.js` | downloads import template in tsv format | passed | 175.81 |
| `imports.test.js` | prevents regular user from importing products | passed | 167.00 |
| `imports.test.js` | allows admin to import products from json | passed | 254.94 |
| `observability.test.js` | health endpoint returns release metadata and request id header | passed | 97.50 |
| `observability.test.js` | liveness and readiness endpoints separate process and backing-service checks | passed | 17.37 |
| `observability.test.js` | echoes incoming request id and returns it on 404 | passed | 13.65 |
| `observability.test.js` | rejects new requests while runtime is draining | passed | 18.74 |
| `openapi-docs.test.js` | keeps the branded Swagger document readable and complete | passed | 3.96 |
| `openapi-docs.test.js` | documents every operation with tags, operationId, success and error responses | passed | 2.36 |
| `openapi-docs.test.js` | keeps path parameters and protected routes explicit | passed | 5.27 |
| `openapi-docs.test.js` | keeps Swagger UI styled for the project and useful for manual checks | passed | 0.49 |
| `openapi-docs.test.js` | keeps README, API docs and wiki linked to the current project surface | passed | 1.65 |
| `runtime-config.test.js` | config prefers environment variables over yaml file values | passed | 9.48 |
| `runtime-config.test.js` | config accepts standard platform host and port aliases | passed | 2.10 |
| `runtime-config.test.js` | config exposes runtime and backing service tuning from the environment | passed | 2.20 |
| `runtime-config.test.js` | production config rejects default JWT secrets | passed | 2.46 |
| `runtime-config.test.js` | structured logger serializes error payloads | passed | 2.55 |
| `runtime-config.test.js` | postgres query adapter preserves mixed-case response aliases | passed | 0.52 |
| `security.test.js` | hashes passwords and validates correct credentials | passed | 462.85 |
| `security.test.js` | signs and verifies access tokens with role payload | passed | 10.07 |
| `security.test.js` | rejects tampered access tokens | passed | 4.83 |
| `smoke.test.js` | serves health endpoint | passed | 98.21 |
| `smoke.test.js` | serves openapi and swagger ui | passed | 31.90 |
| `smoke.test.js` | serves client html, styles and favicon | passed | 29.78 |
| `smoke.test.js` | returns json 404 for unknown api route | passed | 9.25 |
| `surface-coverage.test.js` | covers every API operation, server module, frontend contract and fuzz scenario | passed | 11.52 |
| `users.test.js` | allows admin to list users and promote a regular user | passed | 627.25 |
| `users.test.js` | prevents regular users from reading users or changing roles | passed | 226.42 |
| `users.test.js` | validates role updates and protects the current admin role | passed | 211.83 |
| `validation.test.js` | accept valid dates and reject impossible calendar values | passed | 3.50 |
| `validation.test.js` | accept valid times and reject impossible hour-minute combinations | passed | 0.76 |
| `validation.test.js` | validates email and password rules | passed | 0.85 |
| `validation.test.js` | validates numeric, meal type and category constraints | passed | 2.27 |
| `validation.test.js` | shifts dates forward and backward | passed | 2.57 |
| `validation.test.js` | builds ordered date windows | passed | 2.18 |

## Матрица API-операций

| Метод | Path | operationId | Покрыто тестами |
| --- | --- | --- | --- |
| GET | `/api/health` | `getHealth` | smoke.test.js, observability.test.js |
| GET | `/api/live` | `getLive` | observability.test.js |
| GET | `/api/ready` | `getReady` | observability.test.js |
| POST | `/api/auth/register` | `postAuthRegister` | api.test.js, auth-session.test.js, fuzz.test.js |
| POST | `/api/auth/login` | `postAuthLogin` | api.test.js, auth-session.test.js, contracts.test.js, fuzz.test.js |
| GET | `/api/auth/me` | `getAuthMe` | auth-session.test.js |
| GET | `/api/users` | `getUsers` | users.test.js |
| PATCH | `/api/users/{id}/role` | `patchUsersIdRole` | users.test.js |
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
| `users` | users.test.js |

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
| 100 adversarial API request shapes | covered |

## Примечания

- Сырая Node/V8 таблица `file | line % | branch % | funcs % | uncovered lines` печатается командой `npm run test:v8`.
- Команда `npm run test:v8` включает пороги `100/100/100` и падает, если raw coverage перестает быть полностью зеленым.
- Этот отчет является gate-проверкой функциональной поверхности: он падает, если новая API-операция, серверный модуль, frontend-контракт или fuzz-сценарий не представлен в матрице тестов.
- Fuzzing реализован детерминированными генераторами поверх `node:test`, поэтому внешняя библиотека и сетевой install не требуются.
