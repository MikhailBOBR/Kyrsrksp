# Pre-release checklist

Текущий кандидат на выкладку: `1.0.0-rc.1`

## Что проверить перед выкладкой

1. Прогнать `npm run test:full`.
2. Убедиться, что `Swagger` открывается по `/api/docs`.
3. Проверить вход под `demo` и `admin`.
4. Проверить импорт `JSON/TSV` и экспорт `JSON/PDF`.
5. Проверить Docker-запуск через `docker compose up --build`.
6. Убедиться, что `CI` и `CD` workflow в GitHub зелёные.
7. Подтвердить актуальность переменных окружения для облака.

## Что уже подготовлено

- `CHANGELOG.md` для релизной заметки;
- `npm run test:full` для локального контрольного прогона тестов, V8 coverage и surface coverage;
- `render.yaml` и Docker-конфигурация для deploy-сценария;
- автоматические тесты, включая frontend contracts и fuzzing.
