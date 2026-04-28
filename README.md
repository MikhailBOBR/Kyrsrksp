# Персональный дневник питания с анализом КБЖУ

Клиент-серверное fullstack-приложение для ведения дневника питания, контроля калорий и макронутриентов, планирования рациона, отслеживания воды, самочувствия и сопутствующих показателей.

Проект оформлен как курсовая работа по теме:

> «Персональный дневник питания с анализом КБЖУ»

Текущий pre-release кандидат: `0.2.0-rc.1`

## Технологический стек

- frontend: `HTML + CSS + JavaScript`
- backend: `Node.js 22 + Express`
- database: `PostgreSQL` with `SQLite` fallback for isolated local tests
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
- заметка дня, дневная аналитика и визуальные SVG-графики;
- импорт данных из `JSON`, `CSV` и `TSV` с предпросмотром и шаблонами файлов;
- экспорт отчета в `JSON`, `CSV` и `PDF`;
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

- [Dockerfile](./Dockerfile)
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
|   |-- 06-twelve-factor.md
|   |-- 07-course-checklist.md
|   `-- 08-pre-release-checklist.md
|-- deploy/
|   |-- docker/
|   `-- README.md
|-- wiki/
|-- .github/workflows/
|-- .dockerignore
|-- .env.example
|-- CHANGELOG.md
|-- docker-compose.yml
|-- package.json
|-- package-lock.json
`-- render.yaml
```

## Быстрый запуск

Требование: `Node.js 22`.

```bash
npm install
docker compose up --build
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
npm run dev
npm run config:check
npm run build
npm run migrate
npm run create-admin -- --email=admin@example.com --password=Admin123! --name="Admin User"
npm run seed:large
npm run check:client
npm run pre-release
npm run release
npm test
npm run test:coverage
npm run test:fuzz
docker compose up --build
docker compose --profile ops run --rm migrate
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
- Health: `GET /api/health`, `GET /api/live`, `GET /api/ready`
- Import template: `GET /api/imports/template`
- Import preview/apply: `POST /api/imports/preview`, `POST /api/imports/apply`

## Wiki и проектные материалы

- [wiki/Home.md](./wiki/Home.md)
- [wiki/Architecture.md](./wiki/Architecture.md)
- [wiki/API.md](./wiki/API.md)
- [wiki/Testing-and-QA.md](./wiki/Testing-and-QA.md)
- [wiki/Deployment.md](./wiki/Deployment.md)
- [docs/07-course-checklist.md](./docs/07-course-checklist.md)
- [docs/08-pre-release-checklist.md](./docs/08-pre-release-checklist.md)
- [CHANGELOG.md](./CHANGELOG.md)

## Качество и методология

- тестирование и fuzzing: [docs/05-testing-and-quality.md](./docs/05-testing-and-quality.md)
- методология Twelve-Factor: [docs/06-twelve-factor.md](./docs/06-twelve-factor.md)

## CI/CD
- актуальный CI: матричные прогоны на Node `20/22`, проверка фронтенд-контрактов, coverage summary, docker validation и smoke-проверка одноразовых команд контейнера
- актуальный CD: multi-platform публикация Docker image в `GHCR`, `SBOM/provenance`, отдельный шаг `migrate` из опубликованного образа и опциональный deploy hook для Render

- [ci.yml](./.github/workflows/ci.yml) — матричный CI, coverage и docker validation
- [cd.yml](./.github/workflows/cd.yml) — multi-platform publish в `GHCR` и deploy hook для Render
- [docs/09-ops-and-runtime-checklist.md](./docs/09-ops-and-runtime-checklist.md) — эксплуатационный checklist по Docker, env-конфигурации, логированию и runtime
- [wiki/Operations.md](./wiki/Operations.md) — быстрые operational-команды проекта

## Swagger и качество API

Swagger UI доступен по адресу `http://localhost:8080/api/docs`, а исходная OpenAPI-схема доступна по `http://localhost:8080/api/openapi.json`.

Подробное описание оформления Swagger, правил документирования маршрутов и автоматических проверок находится в [docs/10-swagger-and-api-quality.md](./docs/10-swagger-and-api-quality.md).
