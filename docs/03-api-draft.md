# Черновик API

Текущая версия API уже реализована в коде и дополнительно описана через Swagger. Ниже зафиксирован прикладной набор маршрутов, который можно использовать как базу для UML и последующей детализации.

## Auth

- `POST /api/auth/register` - регистрация нового пользователя.
- `POST /api/auth/login` - вход и получение JWT.
- `GET /api/auth/me` - данные текущего пользователя.

## Goals

- `GET /api/goals` - текущие цели по КБЖУ.
- `PUT /api/goals` - обновление целей по калориям, белкам, жирам и углеводам.

## Products

- `GET /api/products` - список продуктов.
- `POST /api/products` - создание продукта, только для администратора.
- `PUT /api/products/{id}` - обновление продукта, только для администратора.
- `DELETE /api/products/{id}` - удаление продукта, только для администратора.

## Meals

- `GET /api/meals` - получить приёмы пищи пользователя.
  Поддерживаемые query-параметры: `mealType`.
- `POST /api/meals` - создать приём пищи.
- `PUT /api/meals/{id}` - обновить приём пищи.
- `DELETE /api/meals/{id}` - удалить приём пищи.

## Dashboard

- `GET /api/dashboard` - главная агрегированная панель пользователя.
  Возвращает текущую дату, пользователя, цели, meals, summary, hydration, insights, weekly trend, smart score, achievements, recommendations и шаблоны.

## Hydration

- `GET /api/hydration` - сводка по воде за день.
- `POST /api/hydration` - добавить запись воды.
- `DELETE /api/hydration/{id}` - удалить запись воды.

## Templates

- `GET /api/templates` - список пользовательских шаблонов приёмов пищи.
- `POST /api/templates` - создать шаблон вручную.
- `POST /api/templates/from-meal/{mealId}` - создать шаблон из существующей записи.
- `POST /api/templates/{id}/apply` - создать приём пищи из шаблона.
- `DELETE /api/templates/{id}` - удалить шаблон.

## Recipes

- `GET /api/recipes` - список составных рецептов.
- `POST /api/recipes` - создать рецепт из ингредиентов каталога.
- `POST /api/recipes/{id}/apply` - добавить рецепт в дневник питания.
- `POST /api/recipes/{id}/plan` - отправить рецепт в план питания.
- `DELETE /api/recipes/{id}` - удалить рецепт.

## Planner

- `GET /api/planner` - получить план питания за день или период.
- `POST /api/planner` - создать позицию плана вручную.
- `POST /api/planner/from-template/{templateId}` - добавить шаблон в план питания.
- `POST /api/planner/generate-week` - автоматически сформировать недельный план питания.
- `PATCH /api/planner/{id}/completion` - отметить позицию плана выполненной или невыполненной.
- `DELETE /api/planner/{id}` - удалить позицию плана.

## Wellbeing, Metrics и Day Notes

- `GET /api/checkins` - получить дневной check-in и readiness-сводку.
- `PUT /api/checkins` - создать или обновить check-in.
- `DELETE /api/checkins` - удалить check-in за дату.
- `GET /api/metrics` - получить историю замеров тела.
- `POST /api/metrics` - добавить замер тела.
- `DELETE /api/metrics/{id}` - удалить замер тела.
- `GET /api/day-notes` - получить заметку дня.
- `PUT /api/day-notes` - сохранить заметку дня.
- `DELETE /api/day-notes` - удалить заметку дня.
- `GET /api/day-notes/recent` - получить последние заметки.

## Shopping и Favorites

- `GET /api/shopping` - список покупок.
- `POST /api/shopping` - создать позицию списка покупок.
- `POST /api/shopping/from-product/{productId}` - добавить продукт в список покупок.
- `PATCH /api/shopping/{id}/check` - отметить покупку выполненной.
- `DELETE /api/shopping/checked` - очистить отмеченные покупки.
- `DELETE /api/shopping/{id}` - удалить позицию списка покупок.
- `GET /api/favorites` - получить избранные продукты и шаблоны.
- `POST /api/favorites/products/{productId}` - добавить продукт в избранное.
- `DELETE /api/favorites/products/{productId}` - убрать продукт из избранного.
- `POST /api/favorites/templates/{templateId}` - добавить шаблон в избранное.
- `DELETE /api/favorites/templates/{templateId}` - убрать шаблон из избранного.

## Exports

- `GET /api/exports/daily-report?format=json` - выгрузка дневного отчёта в JSON.

## Imports

- `GET /api/imports/template?dataset=meals&format=json` - скачать шаблон импорта.
- `POST /api/imports/preview` - проверить структуру импортируемого файла и получить предпросмотр.
- `POST /api/imports/apply` - загрузить валидные строки в систему.
  Поддерживаемые наборы: `meals`, `templates`, `hydration`, `products`.
  Поддерживаемые форматы: `json`, `tsv`.
  Для `products` требуется роль `admin`.

## Docs

- `GET /api/openapi.json` - OpenAPI-документ.
- `GET /api/docs` - Swagger UI.

## Качество Swagger

OpenAPI-схема расширена доменными схемами, `operationId`, path-параметрами, стандартными ответами ошибок и контрактами для ключевых пользовательских сценариев.

Подробности по оформлению Swagger UI и автоматическим проверкам вынесены в [docs/10-swagger-and-api-quality.md](./10-swagger-and-api-quality.md).
