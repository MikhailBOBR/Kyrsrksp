# Персональный дневник питания с анализом КБЖУ

Клиент-серверное fullstack-приложение для ведения дневника питания, контроля дневных целей и анализа калорий, белков, жиров и углеводов. Текущая версия уже построена как серьёзная основа курсового проекта: есть авторизация, ролевая модель, база данных SQLite, Swagger-документация, CRUD-операции, автоматические тесты, CI/CD и расширенные пользовательские фичи.

## Технологический стек

- backend: `Node.js + Express`
- database: `SQLite`
- auth: `JWT + role-based access control`
- docs: `Swagger UI`
- tests: `node:test`
- ci/cd: `GitHub Actions + Docker + GHCR`
- frontend: `HTML + CSS + JavaScript`

## Что уже реализовано

- регистрация, вход и получение профиля пользователя;
- роли `user` и `admin`;
- цели по КБЖУ с персональными настройками для каждого пользователя;
- CRUD для приёмов пищи;
- справочник продуктов с административным управлением;
- ежедневный dashboard с summary, insights и weekly trend;
- smart score, achievements и streak;
- wellbeing check-in с оценкой настроения, энергии, стресса, аппетита и сна;
- body metrics: вес, процент жира, талия, грудь и история замеров;
- meal planner с планированием приемов пищи и контролем выполнения;
- shopping board для списка покупок с быстрым добавлением из каталога продуктов;
- трекер воды и быстрые кнопки hydration;
- шаблоны приёмов пищи с применением в один клик;
- отправка шаблонов и записей в планер;
- рекомендации по добору КБЖУ на основе каталога продуктов;
- экспорт отчёта за день в `JSON` и `CSV`;
- просмотр dashboard и журнала по выбранной дате;
- светлая и тёмная тема интерфейса;
- фильтрация журнала по типам приёма пищи;
- Swagger по адресу `/api/docs`;
- автоматические API-тесты;
- локальный запуск через Docker;
- CI и CD workflow для тестирования и публикации образа.

## Структура проекта

```text
.
|-- client/
|   |-- app.js
|   |-- index.html
|   |-- styles.css
|   `-- README.md
|-- server/
|   |-- data/
|   |-- src/
|   |   |-- config/
|   |   |-- db/
|   |   |-- lib/
|   |   |-- middlewares/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- dashboard/
|   |   |   |-- docs/
|   |   |   |-- exports/
|   |   |   |-- goals/
|   |   |   |-- hydration/
|   |   |   |-- meals/
|   |   |   |-- products/
|   |   |   `-- templates/
|   |   |-- app.js
|   |   `-- index.js
|   |-- tests/
|   `-- README.md
|-- .github/
|   `-- workflows/
|-- docs/
|-- deploy/
|   |-- docker/
|   `-- README.md
|-- docker-compose.yml
|-- package.json
`-- package-lock.json
```

## Быстрый запуск

Требование: Node.js 22 или совместимая версия.

```bash
npm install
npm start
```

Приложение будет доступно по адресу:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/api/docs
```

CD-пайплайн публикует Docker-образ в `GHCR` при push в `main`.

## Тестовые учётные записи

- пользователь: `demo@nutritrack.local` / `Demo123!`
- администратор: `admin@nutritrack.local` / `Admin123!`

## Полезные команды

```bash
npm start
npm run dev
npm run seed:large
npm test
```

`npm run seed:large` наполняет SQLite большим демонстрационным набором данных:
дополнительные пользователи, каталог продуктов, история приемов пищи, вода и шаблоны.

## Основные API-маршруты

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/goals`
- `PUT /api/goals`
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/meals`
- `POST /api/meals`
- `PUT /api/meals/:id`
- `DELETE /api/meals/:id`
- `GET /api/dashboard`
- `GET /api/hydration`
- `POST /api/hydration`
- `GET /api/checkins`
- `PUT /api/checkins`
- `GET /api/metrics`
- `POST /api/metrics`
- `GET /api/planner`
- `POST /api/planner`
- `PATCH /api/planner/:id/completion`
- `GET /api/shopping`
- `POST /api/shopping`
- `POST /api/shopping/from-product/:productId`
- `GET /api/templates`
- `POST /api/templates`
- `POST /api/templates/:id/apply`
- `GET /api/exports/daily-report`
- `GET /api/openapi.json`

## Что ещё предстоит

1. Перейти с SQLite на PostgreSQL для production-сценария.
2. Вынести UML-диаграммы в отдельные графические материалы.
3. Добавить больше CRUD-сущностей: блюда, рецепты, шаблоны меню и цели по периодам.
4. Подготовить фаззинг-тестирование и расширить покрытие негативных сценариев.
5. Разделить frontend и backend на более независимые сборки.




Все это точно все что было 
