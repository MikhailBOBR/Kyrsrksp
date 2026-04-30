# Pre-release checklist

Текущий кандидат на выкладку: `1.0.0-rc.1`

## Что проверить перед выкладкой

1. Прогнать `npm run pre-release`.
2. Убедиться, что `Swagger` открывается по `/api/docs`.
3. Проверить вход под `demo` и `admin`.
4. Проверить импорт `JSON/TSV` и экспорт `JSON/PDF`.
5. Проверить Docker-запуск через `docker compose up --build`.
6. Убедиться, что `CI` и `CD` workflow в GitHub зелёные.
7. Проверить, что после `CD` workflow в GitHub Packages появился контейнерный пакет `ghcr.io/<owner>/<repo>/food-diary-app`.
8. Подтвердить актуальность переменных окружения для облака.

## Что уже подготовлено

- `CHANGELOG.md` для релизной заметки;
- `npm run pre-release` для локального контрольного прогона frontend contracts, API/fuzz tests, 100% surface coverage и сырой Node/V8 таблицы `file | line % | branch % | funcs % | uncovered lines`;
- `render.yaml` и Docker-конфигурация для deploy-сценария;
- CD workflow публикует Docker image в GitHub Packages / GHCR по push в `main`/`master`, тегу `v1.0.0-rc.1` или ручному запуску;
- автоматические тесты, включая frontend contracts и fuzzing.
