# Архитектура приложения

## Выбранный архитектурный стиль

Для проекта выбрана классическая клиент-серверная архитектура.

- клиентская часть отвечает за интерфейс, навигацию, отправку запросов и визуализацию аналитики;
- серверная часть отвечает за авторизацию, аутентификацию, бизнес-логику, агрегации, валидацию и контроль доступа;
- база данных отвечает за долговременное хранение сущностей предметной области.

Текущая реализация соответствует модели `SPA-like frontend + REST API backend + relational database`.

## Выбранный стек

- frontend: `HTML + CSS + JavaScript`
- backend: `Node.js 22 + Express`
- database: `PostgreSQL` в Docker/runtime-контуре, `SQLite` только как изолированный fallback для локальных тестов
- auth: `JWT`
- docs: `OpenAPI + Swagger UI`
- tests: `node:test`
- containerization: `Docker + docker-compose`
- CI/CD: `GitHub Actions`

Выбор стека сделан в пользу читаемости кода, простого локального запуска и предсказуемой структуры. Для курсового проекта это позволяет показать полный цикл fullstack CRUD-приложения без избыточной сложности.

## Логическая схема слоев

### Клиентский слой

Файл [client/app.js](../client/app.js) управляет состоянием интерфейса, вызывает REST API и обновляет представление в [client/index.html](../client/index.html). Стили сосредоточены в [client/styles.css](../client/styles.css).

### Слой HTTP API

Точка входа [server/src/app.js](../server/src/app.js) подключает middleware, Swagger и маршруты по модулям. Каждый модуль имеет пару `routes/service`, что дает четкое разделение транспорта и логики.

### Слой бизнес-логики

Модули в [server/src/modules](../server/src/modules) инкапсулируют отдельные поддомены:

- `auth`
- `goals`
- `products`
- `meals`
- `templates`
- `recipes`
- `planner`
- `hydration`
- `checkins`
- `metrics`
- `shopping`
- `day-notes`
- `favorites`
- `dashboard`
- `exports`

### Слой данных

В [server/src/db](../server/src/db) находятся инициализация схемы, подключение к БД и seed-данные. В Docker, CI и release-проверках база данных подключается как PostgreSQL backing service через `DB_PROVIDER=postgres` и `DB_*`/`DATABASE_URL`; SQLite остается только локальным fallback для быстрых изолированных тестов.

## Обоснование клиент-серверной схемы

Клиент-серверная архитектура подходит для проекта по следующим причинам:

1. Нужно разделить пользовательский интерфейс и вычислительную логику.
2. Требуется централизованная авторизация и ролевая модель.
3. Нужен единый источник данных для аналитики и отчетов.
4. Необходимо подготовить приложение к контейнеризации и облачному развертыванию.
5. API должно быть пригодно для тестирования и документирования через Swagger.

## Безопасность и роли

В системе используются две роли:

- `user` — работает со своими личными данными;
- `admin` — управляет справочником продуктов.

Ролевая модель реализована middleware `requireAuth` и `requireRole` в [server/src/middlewares/auth.js](../server/src/middlewares/auth.js). Защита распространяется на административные CRUD-операции и приватные пользовательские маршруты.

## UML-материалы

Для графического описания архитектуры подготовлены PlantUML-диаграммы:

- [use-case.puml](./diagrams/use-case.puml) — use case diagram;
- [component-diagram.puml](./diagrams/component-diagram.puml) — component diagram;
- [sequence-login.puml](./diagrams/sequence-login.puml) — sequence diagram для входа;
- [deployment-diagram.puml](./diagrams/deployment-diagram.puml) — deployment diagram;
- [entity-diagram.puml](./diagrams/entity-diagram.puml) — ключевые сущности домена.

Эти файлы можно рендерить в графические материалы для курсовой записки и презентации.

## Двенадцать факторов

Архитектура проекта дополнительно описана с позиции методологии Twelve-Factor App в [06-twelve-factor.md](./06-twelve-factor.md).

## Вывод

Текущая архитектура уже удовлетворяет требованиям полнофункционального fullstack CRUD-приложения: есть клиент, сервер, база данных, роли, тесты, контейнеризация, документация API и подготовка к облачному развертыванию. Структура модулей остается достаточно простой, чтобы проект можно было развивать без потери читаемости.
