# Персональный дневник питания с анализом КБЖУ

Клиент-серверное fullstack-приложение для ведения дневника питания, контроля дневных целей и анализа калорий, белков, жиров и углеводов. Текущая версия уже построена как более серьёзная основа курсового проекта: есть авторизация, ролевая модель, база данных SQLite, Swagger-документация, CRUD-операции, автоматические тесты и Docker-конфигурация.

## Технологический стек

- backend: `Node.js + Express`
- database: `SQLite`
- auth: `JWT + role-based access control`
- docs: `Swagger UI`
- tests: `node:test`
- frontend: `HTML + CSS + JavaScript`

## Что уже реализовано

- регистрация, вход и получение профиля пользователя;
- роли `user` и `admin`;
- цели по КБЖУ с персональными настройками для каждого пользователя;
- CRUD для приёмов пищи;
- справочник продуктов с административным управлением;
- ежедневный dashboard с summary, insights и weekly trend;
- фильтрация журнала по типам приёма пищи;
- Swagger по адресу `/api/docs`;
- автоматические API-тесты;
- локальный запуск через Docker.

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
|   |   |   |-- goals/
|   |   |   |-- meals/
|   |   |   `-- products/
|   |   |-- app.js
|   |   `-- index.js
|   |-- tests/
|   `-- README.md
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

## Тестовые учётные записи

- пользователь: `demo@nutritrack.local` / `Demo123!`
- администратор: `admin@nutritrack.local` / `Admin123!`

## Полезные команды

```bash
npm start
npm run dev
npm test
```

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
- `GET /api/openapi.json`

## Что ещё предстоит

1. Перейти с SQLite на PostgreSQL для production-сценария.
2. Вынести UML-диаграммы в отдельные графические материалы.
3. Добавить больше CRUD-сущностей: блюда, рецепты, шаблоны меню.
4. Подготовить фаззинг-тестирование и расширить покрытие негативных сценариев.
5. Разделить frontend и backend на более независимые сборки.
