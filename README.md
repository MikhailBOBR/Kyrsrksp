# Персональный дневник питания с анализом КБЖУ

Клиент-серверное fullstack-приложение для ведения дневника питания, контроля калорий и макронутриентов, планирования рациона, отслеживания воды, самочувствия и сопутствующих показателей.

Проект оформлен как курсовая работа по теме:

> «Персональный дневник питания с анализом КБЖУ»

## Технологический стек

- frontend: `HTML + CSS + JavaScript`
- backend: `Node.js 22 + Express`
- database: `SQLite`
- auth: `JWT + role-based access control`
- docs: `OpenAPI + Swagger UI`
- tests: `node:test`
- containers: `Docker + docker-compose`
- CI/CD: `GitHub Actions + GHCR`
- cloud-ready deploy: `Render`

## Что реализовано в приложении

- регистрация, вход и получение профиля пользователя;
- роли `user` и `admin`;
- персональные цели по КБЖУ и готовые пресеты целей;
- CRUD для приемов пищи;
- справочник продуктов с административным управлением;
- рецепты, шаблоны и избранное;
- генерация недельного плана питания;
- трекер воды, самочувствие, замеры тела;
- список покупок;
- заметка дня и дневная аналитика;
- экспорт отчета в `JSON` и `CSV`;
- Swagger по `/api/docs`;
- seed-данные для демонстрации;
- Docker и cloud-ready deploy-конфигурация;
- автоматические тесты, негативные сценарии и fuzzing.

## Покрытие требований курсовой

### 1. Анализ предметной области

Подготовлен в [docs/01-domain-overview.md](./docs/01-domain-overview.md).

### 2. Клиент-серверная архитектура и UML

Архитектура описана в [docs/02-architecture.md](./docs/02-architecture.md).

UML-материалы:

- [docs/diagrams/use-case.puml](./docs/diagrams/use-case.puml)
- [docs/diagrams/component-diagram.puml](./docs/diagrams/component-diagram.puml)
- [docs/diagrams/sequence-login.puml](./docs/diagrams/sequence-login.puml)
- [docs/diagrams/deployment-diagram.puml](./docs/diagrams/deployment-diagram.puml)
- [docs/diagrams/entity-diagram.puml](./docs/diagrams/entity-diagram.puml)

### 3. Выбор программного стека

Стек зафиксирован в этом README и в [docs/02-architecture.md](./docs/02-architecture.md).

### 4. Клиентская и серверная части, авторизация, БД, тестовые данные, ролевая модель

Все перечисленное реализовано в коде:

- backend в [server/src](./server/src)
- frontend в [client](./client)
- инициализация БД в [server/src/db/init-schema.js](./server/src/db/init-schema.js)
- массовый seed в [server/src/db/seed-large-data.js](./server/src/db/seed-large-data.js)
- проверки ролей в [server/src/middlewares/auth.js](./server/src/middlewares/auth.js)
- негативные сценарии в [server/tests/api.test.js](./server/tests/api.test.js)

### 5. Фаззинг-тестирование

Отдельный fuzzing-сценарий расположен в [server/tests/fuzz.test.js](./server/tests/fuzz.test.js).

### 6. Git, Dockerfile, README и структура проекта

В репозитории присутствуют:

- [deploy/docker/server.Dockerfile](./deploy/docker/server.Dockerfile)
- [deploy/docker/client.Dockerfile](./deploy/docker/client.Dockerfile)
- [docker-compose.yml](./docker-compose.yml)
- [deploy/README.md](./deploy/README.md)

### 7. Облачное развертывание

Подготовлена deploy-ready конфигурация:

- [render.yaml](./render.yaml)

Ограничение: фактический деплой в облако требует внешнего доступа к GitHub и облачной платформе. В этой локальной сессии подготовлены все конфиги и инструкции, но сам внешний запуск выполняется уже вне sandbox.

## Структура проекта

```text
.
|-- client/
|   |-- app.js
|   |-- favicon.svg
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
|   |   `-- modules/
|   |-- tests/
|   `-- README.md
|-- docs/
|   |-- diagrams/
|   |-- 01-domain-overview.md
|   |-- 02-architecture.md
|   |-- 03-api-draft.md
|   |-- 04-backlog.md
|   |-- 05-testing-and-quality.md
|   `-- 06-twelve-factor.md
|-- deploy/
|   |-- docker/
|   `-- README.md
|-- .github/workflows/
|-- .dockerignore
|-- .env.example
|-- docker-compose.yml
|-- package.json
|-- package-lock.json
`-- render.yaml
```

## Быстрый запуск

Требование: `Node.js 22`.

```bash
npm install
npm start
```

Приложение:

```text
http://localhost:8080
```

Swagger:

```text
http://localhost:8080/api/docs
```

## Тестовые учетные записи

- пользователь: `demo@nutritrack.local / Demo123!`
- администратор: `admin@nutritrack.local / Admin123!`

## Полезные команды

```bash
npm start
npm run dev
npm run seed:large
npm run check:client
npm test
npm run test:coverage
npm run test:fuzz
docker compose up --build
```

## Docker и deploy

Локальный контейнерный запуск:

```bash
docker compose up --build
```

Подробнее:

- [deploy/README.md](./deploy/README.md)

## Документация API

- OpenAPI JSON: `GET /api/openapi.json`
- Swagger UI: `GET /api/docs`

## Качество и методология

- тестирование и fuzzing: [docs/05-testing-and-quality.md](./docs/05-testing-and-quality.md)
- методология Twelve-Factor: [docs/06-twelve-factor.md](./docs/06-twelve-factor.md)

## CI/CD
- актуальный CI: матричные прогоны на Node `20/22`, проверка фронтенд-контрактов, coverage summary и docker validation
- актуальный CD: multi-platform публикация Docker image в `GHCR`, `SBOM/provenance` и опциональный deploy hook для Render

- [ci.yml](./.github/workflows/ci.yml) — тесты и docker build smoke check
- [cd.yml](./.github/workflows/cd.yml) — публикация Docker image в `GHCR`
