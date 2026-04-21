# Server

Серверная часть приложения построена на `Node.js + Express + SQLite`.

Что уже есть:

- модули `auth`, `goals`, `products`, `meals`, `dashboard`;
- JWT-аутентификация и ролевая модель `user/admin`;
- SQLite-база данных с инициализацией схемы и seed-данными;
- Swagger UI и OpenAPI JSON;
- API-тесты на `node:test`;
- раздача статических файлов клиентского интерфейса.

Следующий шаг для сервера - расширить доменную модель и перейти на PostgreSQL.
