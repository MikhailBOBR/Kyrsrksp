# Deploy

## Локальный контейнерный запуск

Для локального запуска используется `docker-compose.yml`, корневой `Dockerfile` и серверный Dockerfile:

```bash
docker compose up --build
```

После запуска приложение доступно по адресу:

```text
http://localhost:8080
```

Swagger:

```text
http://localhost:8080/api/docs
```

## Что использует контейнер

- [Dockerfile](../Dockerfile) — основной runtime-образ проекта;
- [deploy/docker/server.Dockerfile](./docker/server.Dockerfile) — серверный Dockerfile для deploy-сценариев;
- [deploy/docker/client.Dockerfile](./docker/client.Dockerfile) — заготовка для варианта с отделенным frontend;
- [docker-compose.yml](../docker-compose.yml) — локальная оркестрация;
- [render.yaml](../render.yaml) — deploy-ready конфигурация для облачного запуска.

## Облачное развертывание

В репозитории подготовлен `render.yaml`, который позволяет развернуть приложение как Docker-based web service.

### Переменные окружения

Для облака используются:

- `APP_ENV`
- `RELEASE_VERSION`
- `SERVER_PORT`
- `JWT_SECRET`
- `DB_PROVIDER`
- `DATABASE_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_PATH` только для локального SQLite fallback

### Постоянное хранилище

Основной production-friendly режим рассчитан на PostgreSQL. В `render.yaml` web service получает `DATABASE_URL` из managed PostgreSQL database `nutritrack-db`. SQLite оставлен как легкий fallback для локальных тестов и изолированных запусков.

## Что важно для production

1. Установить безопасный `JWT_SECRET`.
2. Не коммитить production-базу данных в репозиторий.
3. В production использовать managed PostgreSQL как основное хранилище.
4. Использовать опубликованный образ из `GHCR` или прямую docker-сборку через cloud platform.

## CI/CD

- [ci.yml](../.github/workflows/ci.yml) проверяет проект на каждом push и pull request.
- [cd.yml](../.github/workflows/cd.yml) публикует Docker image в `GHCR`, выполняет шаг `migrate` из опубликованного образа и затем может триггерить deploy hook.

## Ограничение текущей среды

В текущем локальном окружении подготовлена полностью deploy-ready конфигурация, но фактическое развертывание в внешнем облаке требует доступа к облачной платформе и репозиторию GitHub. Эти действия выполняются уже вне локальной sandbox-сессии.
