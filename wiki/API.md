# Wiki: API И Swagger

## Точки Входа

- Swagger UI: `/api/docs`
- OpenAPI JSON: `/api/openapi.json`

## Основные Группы Маршрутов

- `auth` — регистрация, вход, профиль;
- `goals` — цели и пресеты КБЖУ;
- `products` — каталог продуктов;
- `meals` — дневник приёмов пищи;
- `dashboard` — агрегированная аналитика;
- `hydration`, `checkins`, `metrics` — состояние дня;
- `templates`, `recipes`, `planner` — ускоренный ввод и планирование;
- `shopping`, `favorites`, `day-notes` — дополнительные пользовательские сценарии;
- `exports` — ежедневные отчёты.

## Что Улучшено В Swagger

- спокойное брендированное оформление;
- описанные теги и ключевые схемы;
- видимые параметры экспорта и auth-flow;
- включён `Try it out`, фильтр и сохранение авторизации.

## Подробности

- [docs/03-api-draft.md](../docs/03-api-draft.md)
- [server/src/modules/docs/openapi.js](../server/src/modules/docs/openapi.js)
