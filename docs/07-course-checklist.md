# Чек-лист Выполнения Курсового Проекта

Документ фиксирует соответствие репозитория заданию по теме:

> «Персональный дневник питания с анализом КБЖУ»

## Сводный статус

| Пункт задания | Статус | Подтверждающие материалы |
| --- | --- | --- |
| 1. Анализ предметной области | Выполнено | [01-domain-overview.md](./01-domain-overview.md) |
| 2. Клиент-серверная архитектура и UML | Выполнено | [02-architecture.md](./02-architecture.md), [diagrams](./diagrams) |
| 3. Выбор программного стека | Выполнено | [README.md](../README.md), [02-architecture.md](./02-architecture.md) |
| 4. Клиент, сервер, auth, БД, seed, роли | Выполнено | [client](../client), [server/src](../server/src), [init-schema.js](../server/src/db/init-schema.js), [seed-large-data.js](../server/src/db/seed-large-data.js), [auth.js](../server/src/middlewares/auth.js) |
| 5. Фаззинг-тестирование | Выполнено | [fuzz.test.js](../server/tests/fuzz.test.js), [05-testing-and-quality.md](./05-testing-and-quality.md) |
| 6. Git, Dockerfile, README и структура проекта | Выполнено | [README.md](../README.md), [Dockerfile](../Dockerfile), [docker-compose.yml](../docker-compose.yml), [server.Dockerfile](../deploy/docker/server.Dockerfile), [deploy/README.md](../deploy/README.md) |
| 7. Облачное развертывание | Готово к финальному внешнему запуску | [render.yaml](../render.yaml), [cd.yml](../.github/workflows/cd.yml), [deploy/README.md](../deploy/README.md) |

## Подробная Расшифровка

### 1. Анализ предметной области

- сформированы основные сущности: пользователь, цели КБЖУ, продукт, приём пищи, вода, рецепт, шаблон, план питания, заметка дня, список покупок;
- определены пользовательские сценарии: ведение дневника, контроль целей, планирование, экспорт, администрирование каталога;
- зафиксированы ограничения и прикладная ценность системы.

Основной материал: [01-domain-overview.md](./01-domain-overview.md).

### 2. Архитектура и UML

- выбрана клиент-серверная схема `frontend + REST API + relational DB`;
- архитектурные слои и распределение ответственности описаны в [02-architecture.md](./02-architecture.md);
- подготовлены PlantUML-диаграммы use case, component, deployment, sequence и entity.

### 3. Программный стек

Зафиксированный стек:

- frontend: `HTML + CSS + JavaScript`;
- backend: `Node.js 22 + Express`;
- database: `PostgreSQL` с локальным `SQLite` fallback для тестового режима;
- auth: `JWT + RBAC`;
- docs: `OpenAPI + Swagger UI`;
- tests: `node:test`;
- containers: `Docker + docker-compose`;
- CI/CD: `GitHub Actions + GHCR`;
- cloud-ready deploy: `Render`.

### 4. Реализация приложения

В репозитории уже реализованы:

- регистрация, вход и получение профиля пользователя;
- роли `user/admin`;
- персональные цели и пресеты КБЖУ;
- CRUD для приёмов пищи;
- административный каталог продуктов;
- шаблоны, рецепты, избранное;
- планировщик и автогенерация недельного плана;
- вода, самочувствие, замеры тела, заметки дня;
- список покупок;
- экспорт в `JSON` и `PDF`;
- массовое заполнение тестовыми данными;
- негативные тесты для ролевой модели и валидации.

### 5. Фаззинг-тестирование

- фаззинг вынесен в отдельный сценарий [fuzz.test.js](../server/tests/fuzz.test.js);
- проверяются некорректные payload-ы регистрации и защищённых бизнес-маршрутов;
- зафиксировано требование отсутствия `500`-ошибок при мусорном вводе.

### 6. Репозиторий, Docker и README

Условия пункта закрыты:

- проект размещён в Git-структуре с разбиением на `client`, `server`, `docs`, `deploy`;
- присутствуют `Dockerfile`, `docker-compose.yml`, `.dockerignore`;
- главный README описывает стек, структуру, команды, тесты, деплой и покрытие требований;
- добавлены one-off команды `migrate` и `create-admin`, а также runtime/ops checklist в [09-ops-and-runtime-checklist.md](./09-ops-and-runtime-checklist.md);
- подготовлены дополнительные wiki-материалы в каталоге [wiki](../wiki).

### 7. Облачное развертывание

С технической стороны проект готов:

- есть `render.yaml` под облачный запуск;
- CI/CD публикует Docker-образ в `GHCR`;
- предусмотрен deploy hook для `Render`.

Ограничение одно: финальный внешний деплой выполняется уже в GitHub/Render после push репозитория и указания секретов. Внутри локальной sandbox-сессии этот шаг нельзя завершить физически, но весь конфигурационный слой уже подготовлен.

## Итог

Внутри репозитория закрыты все пункты `1-6`. Пункт `7` закрыт по конфигурации и документации и требует только финального запуска во внешней облачной среде.
