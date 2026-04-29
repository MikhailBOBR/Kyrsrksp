# Тестирование и контроль качества

## Что покрыто в проекте

### Автоматические API-тесты

Основной набор сценариев находится в [server/tests/api.test.js](../server/tests/api.test.js). Тесты покрывают:

- регистрацию и вход;
- доступ к dashboard;
- работу целей;
- ограничения ролевой модели;
- CRUD-операции по ключевым сущностям;
- применение шаблонов и рецептов;
- генерацию недельного плана;
- экспорт отчетов;
- публикацию OpenAPI-документа.

Дополнительные наборы тестов:

- [server/tests/openapi-docs.test.js](../server/tests/openapi-docs.test.js) — качество Swagger/OpenAPI, operationId, схемы, path-параметры и ссылки документации;
- [server/tests/contracts.test.js](../server/tests/contracts.test.js) — негативные API-контракты;
- [server/tests/api-crud-coverage.test.js](../server/tests/api-crud-coverage.test.js) — расширенное CRUD-покрытие update/delete/manual-create веток;
- [server/tests/imports.test.js](../server/tests/imports.test.js) — импорт `JSON/TSV`;
- [server/tests/observability.test.js](../server/tests/observability.test.js) — health check, request id и runtime-состояние;
- [server/tests/client-static.test.js](../server/tests/client-static.test.js) — статические контракты клиентского интерфейса;
- [server/tests/surface-coverage.test.js](../server/tests/surface-coverage.test.js) — gate на 100% покрытия OpenAPI-операций, серверных модулей, frontend-контрактов и fuzz-сценариев.

### Фаззинг-тестирование

Для проекта подготовлен отдельный фаззинг-тест в [server/tests/fuzz.test.js](../server/tests/fuzz.test.js). Он отправляет случайные и некорректные payload в наиболее критичные маршруты и проверяет, что система:

- не падает с кодом `500`;
- корректно отвечает `400`, `401`, `403` или `404`;
- сохраняет устойчивость при множестве вариаций входных данных.

### Проверка ролевой модели

Ролевая модель валидируется через негативные тесты:

- обычный пользователь не может выполнять admin-only CRUD маршруты каталога;
- приватные маршруты требуют JWT;
- доступ к административным операциям ограничен middleware `requireRole`.

## Команды запуска тестов

```bash
npm test
npm run test:fuzz
npm run test:coverage
npm run test:v8
npm run test:surface
npm run test:full
```

Команды `npm run test:coverage` и `npm run test:surface` генерируют отчет [11-test-coverage-report.md](./11-test-coverage-report.md) и показывают 100% покрытие функциональной поверхности проекта. Команда `npm run test:v8` оставлена как низкоуровневая V8-метрика по строкам/веткам для инженерного анализа.

## Качество структуры проекта

### Что уже сделано

- код разбит по модулям;
- бизнес-логика вынесена из маршрутов в сервисы;
- схема БД и seed вынесены отдельно;
- API документировано через Swagger;
- Docker и CI/CD добавлены в репозиторий.

### Что проверяется в CI

Workflow [ci.yml](../.github/workflows/ci.yml):

- устанавливает зависимости;
- запускает автоматические тесты;
- выполняет docker build smoke check.
- проверяет Swagger/OpenAPI и документационные ссылки через `openapi-docs.test.js`.

Workflow [cd.yml](../.github/workflows/cd.yml):

- собирает production-образ;
- публикует его в `GHCR`.

## Вывод

Проект покрыт не только позитивными пользовательскими сценариями, но и негативными проверками, включая фаззинг и контроль ролевой модели. Это позволяет использовать репозиторий не как демонстрационную заготовку, а как инженерно оформленный курсовой проект.
