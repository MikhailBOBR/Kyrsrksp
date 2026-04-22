# Deploy

## Локальный контейнерный запуск

Для локального запуска используется `docker-compose.yml` и серверный Dockerfile:

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

- [deploy/docker/server.Dockerfile](./docker/server.Dockerfile) — основной контейнер приложения;
- [deploy/docker/client.Dockerfile](./docker/client.Dockerfile) — заготовка для варианта с отделенным frontend;
- [docker-compose.yml](../docker-compose.yml) — локальная оркестрация;
- [render.yaml](../render.yaml) — deploy-ready конфигурация для облачного запуска.

## Облачное развертывание

В репозитории подготовлен `render.yaml`, который позволяет развернуть приложение как Docker-based web service.

### Переменные окружения

Для облака используются:

- `SERVER_PORT`
- `JWT_SECRET`
- `DB_PATH`

### Постоянное хранилище

Для SQLite требуется persistent disk. В конфигурации Render это уже отражено через `disk.mountPath=/var/data` и `DB_PATH=/var/data/app.db`.

## Что важно для production

1. Установить безопасный `JWT_SECRET`.
2. Не коммитить production-базу данных в репозиторий.
3. При росте нагрузки заменить SQLite на managed PostgreSQL.
4. Использовать опубликованный образ из `GHCR` или прямую docker-сборку через cloud platform.

## CI/CD

- [ci.yml](../.github/workflows/ci.yml) проверяет проект на каждом push и pull request.
- [cd.yml](../.github/workflows/cd.yml) публикует Docker image в `GHCR` при push в `main`.

## Ограничение текущей среды

В текущем локальном окружении подготовлена полностью deploy-ready конфигурация, но фактическое развертывание в внешнем облаке требует доступа к облачной платформе и репозиторию GitHub. Эти действия выполняются уже вне локальной sandbox-сессии.
