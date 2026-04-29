# Wiki: Архитектура

## Модель Приложения

Проект построен по клиент-серверной схеме:

- frontend на `HTML + CSS + JavaScript`;
- backend на `Node.js + Express`;
- база данных `PostgreSQL` в Docker/runtime/deploy-контуре;
- `SQLite` используется только как изолированный fallback для локальных тестов;
- взаимодействие по `REST API`;
- аутентификация через `JWT`;
- ролевая модель `user/admin`.

## Слои

- `client/` — интерфейс, навигация, формы и визуализация аналитики;
- `server/src/modules/` — бизнес-модули предметной области;
- `server/src/middlewares/` — auth, RBAC и обработка ошибок;
- `server/src/db/` — схема БД и seed-данные.

## UML-Материалы

- [use-case.puml](../docs/diagrams/use-case.puml)
- [component-diagram.puml](../docs/diagrams/component-diagram.puml)
- [sequence-login.puml](../docs/diagrams/sequence-login.puml)
- [deployment-diagram.puml](../docs/diagrams/deployment-diagram.puml)
- [entity-diagram.puml](../docs/diagrams/entity-diagram.puml)

## Подробное Описание

Полная архитектурная записка находится в [docs/02-architecture.md](../docs/02-architecture.md).
