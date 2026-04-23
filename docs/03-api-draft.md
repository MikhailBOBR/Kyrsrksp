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

## Exports

- `GET /api/exports/daily-report?format=json` - выгрузка дневного отчёта в JSON.
- `GET /api/exports/daily-report?format=csv` - выгрузка дневного отчёта в CSV.

## Imports

- `GET /api/imports/template?dataset=meals&format=json` - скачать шаблон импорта.
- `POST /api/imports/preview` - проверить структуру импортируемого файла и получить предпросмотр.
- `POST /api/imports/apply` - загрузить валидные строки в систему.
  Поддерживаемые наборы: `meals`, `templates`, `hydration`, `products`.
  Поддерживаемые форматы: `json`, `csv`, `tsv`.
  Для `products` требуется роль `admin`.

## Docs

- `GET /api/openapi.json` - OpenAPI-документ.
- `GET /api/docs` - Swagger UI.

## Следующий шаг

Следующим этапом этот draft можно расширить OpenAPI-схемами ответов, описанием кодов ошибок и вариантами облачного развёртывания.
