# Рацион

[![CI](https://github.com/mikhailbobr/kyrsrksp/actions/workflows/ci.yml/badge.svg)](https://github.com/mikhailbobr/kyrsrksp/actions/workflows/ci.yml)
[![CD](https://github.com/mikhailbobr/kyrsrksp/actions/workflows/cd.yml/badge.svg)](https://github.com/mikhailbobr/kyrsrksp/actions/workflows/cd.yml)
![Node.js](https://img.shields.io/badge/Node.js-20%2F22-339933)
![Express](https://img.shields.io/badge/Express-5.x-111111)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED)

> Персональный дневник питания с анализом КБЖУ, планированием рациона и полной серверной API-частью.

`Рацион` - клиент-серверное fullstack-приложение для учета питания, контроля калорий и макронутриентов, планирования меню, отслеживания воды, самочувствия, замеров тела и сопутствующей дневной аналитики.

Проект оформлен как курсовая работа по теме «Персональный дневник питания с анализом КБЖУ» и доведен до deploy-ready состояния: есть модульный backend, статический frontend, OpenAPI/Swagger, PostgreSQL-контур, Docker, GitHub Actions, тесты и эксплуатационная документация.

Текущий pre-release кандидат: `1.0.0-rc.3`.

![Рацион](./client/readme-hero.png)

## Содержание

- [Возможности](#возможности)
- [Технологический стек](#технологический-стек)
- [Быстрый запуск](#быстрый-запуск)
- [Тестовые учетные записи](#тестовые-учетные-записи)
- [Данные и seed](#данные-и-seed)
- [Полезные команды](#полезные-команды)
- [Архитектура](#архитектура)
- [API](#api)
- [Тестирование и качество](#тестирование-и-качество)
- [CI/CD без случайного production deploy](#cicd-без-случайного-production-deploy)
- [Покрытие требований курсовой](#покрытие-требований-курсовой)
- [Структура проекта](#структура-проекта)
- [Документация](#документация)

## Возможности

- регистрация, вход, JWT-сессия и получение текущего профиля;
- роли `user` и `admin` с разграничением доступа к административным операциям;
- персональные цели по калориям, белкам, жирам и углеводам;
- готовые пресеты целей и быстрый перенос цели в профиль;
- CRUD для приемов пищи с фильтрацией по дате и типу;
- справочник продуктов с поиском и административным управлением;
- рецепты, шаблоны приемов пищи и избранное;
- генерация недельного плана питания;
- трекер воды, самочувствие, readiness-сводка и замеры тела;
- список покупок с добавлением продуктов и отметкой выполненных пунктов;
- заметка дня и дневная аналитика;
- SVG-графики по КБЖУ, воде и динамике показателей;
- импорт данных из `JSON` и `TSV` с предпросмотром;
- выгрузка дневного отчета в `JSON` и `PDF`;
- Swagger UI и исходная OpenAPI-схема;
- демо-данные для локального и облачного стенда;
- Docker/Docker Compose и cloud-ready конфигурация для Render;
- автоматические тесты, негативные сценарии, contract checks и fuzzing.

## Технологический стек

| Зона | Технологии |
| --- | --- |
| Frontend | `HTML`, `CSS`, vanilla `JavaScript` |
| Backend | `Node.js 22`, `Express 5` |
| База данных | `PostgreSQL` для runtime/deploy, `SQLite` как локальный fallback |
| Auth | `JWT`, роли `user/admin`, bcrypt-хеширование паролей |
| API docs | `OpenAPI`, `Swagger UI` |
| Tests | `node:test`, contract checks, fuzzing, coverage gates |
| Containers | `Docker`, `docker-compose` |
| CI/CD | `GitHub Actions`, `GHCR`, manual/tag-based CD |
| Cloud | `Render` blueprint через `render.yaml` |

## Быстрый запуск

Требования:

- `Node.js 22` для локального запуска без Docker;
- `Docker` и `Docker Compose` для полного PostgreSQL-контура.

### Вариант 1: Docker Compose

```bash
docker compose up --build
```

После запуска:

- приложение: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/api/docs`
- OpenAPI JSON: `http://localhost:8080/api/openapi.json`
- readiness check: `http://localhost:8080/api/ready`

### Вариант 2: локальный Node.js

```bash
npm install
npm run config:check
npm run migrate
npm run dev
```

По умолчанию пример конфигурации находится в [.env.example](./.env.example). Для production нельзя оставлять `JWT_SECRET=change_me`.

## Тестовые учетные записи

Если включены `SEED_DEMO_DATA=true` или `SEED_LARGE_DATA=true`, доступны учетные записи:

| Роль | Логин | Пароль |
| --- | --- | --- |
| Пользователь | `demo@nutritrack.local` | `Demo123!` |
| Администратор | `admin@nutritrack.local` | `Admin123!` |

## Данные и seed

- `PostgreSQL` используется как основная БД для Docker/runtime/deploy-контура, включая Render.
- `SQLite` оставлен как легкий fallback для локальных изолированных запусков и тестов.
- `AUTO_MIGRATE_ON_BOOT=true` автоматически применяет схему при старте сервиса.
- `SEED_DEMO_DATA=true` включает базовый демонстрационный набор данных.
- `SEED_LARGE_DATA=true` включает массовый seed для полноценной демо-базы.
- В [docker-compose.yml](./docker-compose.yml) массовый seed включен для локального PostgreSQL-стенда.
- В [render.yaml](./render.yaml) массовый seed и `autoDeploy` включены для облачного демо-стенда.
- `npm run seed:large` запускает массовое наполнение вручную. Команда идемпотентна и не должна создавать дубли при повторном запуске.
- `starter-workspace` автоматически дозаполняет личные шаблоны, рецепты, избранное и свежую историю для нового или пустого пользователя при регистрации, входе, открытии рецептов/шаблонов и генерации недельного плана.

## Полезные команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | запуск сервера в watch-режиме |
| `npm run start` | обычный запуск приложения |
| `npm run config:check` | проверка runtime-конфигурации |
| `npm run migrate` | применение схемы БД |
| `npm run create-admin -- --email=admin@example.com --password=Admin123! --name="Admin User"` | создание администратора |
| `npm run seed:demo` | человекочитаемые демо-данные |
| `npm run seed:large` | массовое демо-наполнение |
| `npm run check:client` | статические frontend-контракты |
| `npm test` | основной набор тестов |
| `npm run test:coverage` | полный отчет: результаты, surface coverage и V8 coverage |
| `npm run test:fuzz` | fuzzing-сценарии |
| `npm run test:full` | frontend checks и полный coverage gate |
| `docker compose up --build` | полный локальный запуск |
| `docker compose --profile ops run --rm migrate` | миграция через одноразовый контейнер |

## Архитектура

Приложение построено как монолитный web service с разделением клиентской и серверной частей внутри одного репозитория:

- `client` - статический интерфейс, который обслуживается Express;
- `server/src/app.js` - сборка Express-приложения, API routes, Swagger и static middleware;
- `server/src/modules` - доменные модули формата `routes + service`;
- `server/src/db` - подключение к БД, инициализация схемы, seed и стартовое наполнение личного рабочего пространства;
- `server/src/middlewares` - request context, auth/RBAC и обработка ошибок;
- `server/tests` - API, smoke, security, contracts, observability, import/export и fuzz тесты.

Основной runtime-контур рассчитан на PostgreSQL. SQLite сохранен как fallback, чтобы тесты и локальные эксперименты могли запускаться без внешней БД.

## API

Основные entry points:

| Endpoint | Назначение |
| --- | --- |
| `GET /api/health` | базовое состояние сервиса |
| `GET /api/live` | liveness check |
| `GET /api/ready` | readiness check с проверкой БД |
| `GET /api/openapi.json` | исходная OpenAPI-схема |
| `GET /api/docs` | Swagger UI |
| `POST /api/auth/register` | регистрация пользователя |
| `POST /api/auth/login` | вход и получение JWT |
| `GET /api/dashboard` | дневная сводка |
| `GET /api/imports/template` | шаблон импорта |
| `POST /api/imports/preview` | предпросмотр импорта |
| `POST /api/imports/apply` | применение импорта |
| `GET /api/exports/daily-report` | дневной отчет в `JSON` или `PDF` |

Полная матрица маршрутов описана в [wiki/API.md](./wiki/API.md), [docs/03-api-draft.md](./docs/03-api-draft.md) и автоматически проверяемой OpenAPI-схеме.

## Тестирование и качество

Качество проекта закрывается несколькими слоями:

- `npm run check:client` проверяет статические frontend-контракты;
- `npm test` запускает 184 автоматических теста на `node:test`;
- `npm run test:coverage` генерирует таблицу результатов, surface coverage и raw Node/V8 coverage;
- `npm run test:v8` включает пороги `100/100/100` по lines, branches и functions;
- `npm run test:surface` подтверждает 100% покрытие заявленной функциональной поверхности;
- `npm run test:fuzz` прогоняет 105 детерминированных fuzz-проверок, включая 100 adversarial API shapes, для защиты от 500-ошибок на мусорных payload.

Текущий отчет:

| Поверхность | Покрыто | Всего | Покрытие |
| --- | ---: | ---: | ---: |
| OpenAPI-операции | 65 | 65 | 100% |
| Серверные модули | 18 | 18 | 100% |
| Frontend-контракты | 10 | 10 | 100% |
| Fuzz-сценарии | 5 | 5 | 100% |

Подробности находятся в [docs/05-testing-and-quality.md](./docs/05-testing-and-quality.md) и [docs/11-test-coverage-report.md](./docs/11-test-coverage-report.md).

## CI/CD

В проекте настроены два GitHub Actions workflow:

| Workflow | Запуск | Назначение |
| --- | --- | --- |
| [CI](./.github/workflows/ci.yml) | каждый push, pull request, ручной запуск, nightly schedule | проверка кода, тесты, coverage и Docker validation |
| [CD](./.github/workflows/cd.yml) | release-теги `v*` или ручной запуск | публикация Docker image в GHCR и управляемый deploy |

CI проверяет проект на Node.js `20` и `22`, запускает frontend-контракты, основной набор тестов, coverage summary и Docker smoke checks с PostgreSQL.

CD отделен от обычных коммитов: релизный контур через GitHub Actions запускается только по тегу версии или вручную.

Для Render в [render.yaml](./render.yaml) включен `autoDeploy`, поэтому подключенный облачный демо-стенд может обновляться автоматически после изменения отслеживаемой ветки.

## Покрытие требований курсовой

| Требование | Где закрыто |
| --- | --- |
| Анализ предметной области | [docs/01-domain-overview.md](./docs/01-domain-overview.md) |
| Клиент-серверная архитектура | [docs/02-architecture.md](./docs/02-architecture.md), [server/src](./server/src), [client](./client) |
| UML-материалы | [docs/diagrams](./docs/diagrams) |
| Выбор программного стека | этот README и [docs/02-architecture.md](./docs/02-architecture.md) |
| Авторизация и ролевая модель | [server/src/modules/auth](./server/src/modules/auth), [server/src/middlewares/auth.js](./server/src/middlewares/auth.js) |
| База данных и тестовые данные | [server/src/db](./server/src/db), [scripts/seed-readable-demo.js](./scripts/seed-readable-demo.js) |
| Негативные сценарии | [server/tests/api.test.js](./server/tests/api.test.js), [server/tests/contracts.test.js](./server/tests/contracts.test.js) |
| Fuzzing | [server/tests/fuzz.test.js](./server/tests/fuzz.test.js) |
| Git, Dockerfile, README | [.github/workflows](./.github/workflows), [Dockerfile](./Dockerfile), этот README |
| Облачное развертывание | [render.yaml](./render.yaml), [deploy/README.md](./deploy/README.md), [docs/09-ops-and-runtime-checklist.md](./docs/09-ops-and-runtime-checklist.md) |

UML-диаграммы:

- [docs/diagrams/use-case.puml](./docs/diagrams/use-case.puml)
- [docs/diagrams/component-diagram.puml](./docs/diagrams/component-diagram.puml)
- [docs/diagrams/sequence-login.puml](./docs/diagrams/sequence-login.puml)
- [docs/diagrams/deployment-diagram.puml](./docs/diagrams/deployment-diagram.puml)
- [docs/diagrams/entity-diagram.puml](./docs/diagrams/entity-diagram.puml)

## Структура проекта

```text
.
|-- client/
|   |-- app.js
|   |-- favicon.svg
|   |-- hero-dashboard-illustration.svg
|   |-- index.html
|   |-- readme-hero.png
|   |-- styles.css
|   `-- README.md
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- db/
|   |   |-- lib/
|   |   |-- middlewares/
|   |   |-- modules/
|   |   `-- runtime/
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
|   |-- 08-pre-release-checklist.md
|   |-- 09-ops-and-runtime-checklist.md
|   |-- 10-swagger-and-api-quality.md
|   `-- 11-test-coverage-report.md
|-- deploy/
|   |-- docker/
|   `-- README.md
|-- wiki/
|-- .github/workflows/
|   |-- ci.yml
|   `-- cd.yml
|-- .env.example
|-- CHANGELOG.md
|-- Dockerfile
|-- docker-compose.yml
|-- package.json
|-- package-lock.json
`-- render.yaml
```

## Документация

- [client/README.md](./client/README.md) - устройство frontend-части;
- [server/README.md](./server/README.md) - устройство backend-части;
- [deploy/README.md](./deploy/README.md) - контейнерный запуск и облачный контур;
- [wiki/Home.md](./wiki/Home.md) - навигация по wiki;
- [wiki/Architecture.md](./wiki/Architecture.md) - архитектура приложения;
- [wiki/API.md](./wiki/API.md) - API и сценарии интеграции;
- [wiki/Testing-and-QA.md](./wiki/Testing-and-QA.md) - тестирование и QA;
- [wiki/Deployment.md](./wiki/Deployment.md) - deployment notes;
- [wiki/Operations.md](./wiki/Operations.md) - эксплуатационные команды;
- [docs/06-twelve-factor.md](./docs/06-twelve-factor.md) - соответствие Twelve-Factor App;
- [docs/08-pre-release-checklist.md](./docs/08-pre-release-checklist.md) - pre-release checklist;
- [docs/10-swagger-and-api-quality.md](./docs/10-swagger-and-api-quality.md) - Swagger и качество API-документации;
- [CHANGELOG.md](./CHANGELOG.md) - история изменений.

## Авторские права

**Автор и правообладатель:** Кашпирев М. Д.

Проект создан Кашпиревым М. Д. Все права на проект принадлежат автору. © 2026 Кашпирев М. Д. Все права защищены.
