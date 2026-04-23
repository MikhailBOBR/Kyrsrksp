# Runtime, Docker и 12-Factor Checklist

Этот документ фиксирует, что уже реализовано в проекте по эксплуатационному и инфраструктурному контуру.

## 1. Репозиторий и модульность

- backend разбит на `config`, `db`, `lib`, `middlewares`, `modules`, `runtime`
- frontend отделен в каталог `client`
- бизнес-логика и роутинг разведены по модулям
- жестко прописанные локальные пути вида `C:\Users\...` в коде не используются

## 2. Контейнеризация

- корневой [Dockerfile](../Dockerfile) добавлен
- серверный Dockerfile в [deploy/docker/server.Dockerfile](../deploy/docker/server.Dockerfile) синхронизирован
- добавлен [ .dockerignore ](../.dockerignore) с исключением `node_modules`, логов, локальных БД и временных файлов
- приложение слушает `0.0.0.0` и настраиваемый `SERVER_PORT`
- healthcheck встроен в Dockerfile

## 3. Конфигурация через окружение

- все ключевые настройки вынесены в [server/src/config/env.js](../server/src/config/env.js)
- есть значения по умолчанию для локального запуска
- есть [.env.example](../.env.example)
- `.env` исключен через [.gitignore](../.gitignore)
- добавлен [config/local.yaml.example](../config/local.yaml.example) для локальной разработки
- переменные окружения имеют приоритет над YAML-файлом

## 4. Backing services и stateless-подход

- [docker-compose.yml](../docker-compose.yml) теперь описывает `app`, `postgres`, `redis` и одноразовый сервис `migrate`
- авторизация stateless: используется JWT, серверных sticky-сессий нет
- состояние приложения хранится в БД, а не в памяти процесса
- для текущего release candidate рабочий runtime по умолчанию использует `SQLite`
- параметры `PostgreSQL/Redis` уже вынесены в конфигурацию и compose, что закрывает инфраструктурную подготовку

## 5. Build, release, run

- CI публикует и проверяет проект в [ci.yml](../.github/workflows/ci.yml)
- CD публикует multi-platform image в `GHCR` в [cd.yml](../.github/workflows/cd.yml)
- образ получает уникальные теги, включая commit-based tag
- релиз отделен от конфигурации: настройки передаются через переменные среды
- release metadata выводится в `health` и structured logs

## 6. Логи и наблюдаемость

- добавлен structured logger в [server/src/lib/logger.js](../server/src/lib/logger.js)
- логи пишутся в `stdout/stderr` в JSON-формате
- добавлен `X-Request-ID` и сквозной request context
- ошибки и 404 теперь возвращают `requestId`
- runtime health отражает `status`, `ready`, `service`, `version`, `environment`

## 7. Graceful shutdown

- приложение отслеживает `SIGINT` и `SIGTERM`
- при завершении сервис переводится в режим draining
- новые запросы получают `503 Service is shutting down`
- текущие соединения закрываются с тайм-аутом
- соединение с БД закрывается корректно

## 8. Admin/one-off команды

- `node server/src/cli.js server`
- `node server/src/cli.js migrate`
- `node server/src/cli.js create-admin --email=... --password=... --name=...`
- в `package.json` добавлены `npm run migrate` и `npm run create-admin`
- compose содержит одноразовый сервис `migrate`

## 9. Тесты

- добавлены проверки на request id, health metadata, draining-mode и конфигурацию
- покрыты admin/security/import/export/runtime сценарии
- `npm test` и `npm run check:client` остаются основными контрольными командами

## 10. Что считать оставшимся риском

- основной прикладной runtime в этой версии по умолчанию работает на `SQLite`, а не на живом `PostgreSQL`
- инфраструктурная обвязка под `PostgreSQL` уже подготовлена, но полное переключение всего CRUD-слоя на postgres-провайдер потребует отдельной миграции data access слоя

Для текущей курсовой это означает следующее: контейнеризация, конфигурация, логирование, CI/CD, одноразовые команды, graceful shutdown и stateless-auth уже приведены в порядок; самый тяжелый следующий шаг на будущее — полноценный runtime adapter под PostgreSQL.
