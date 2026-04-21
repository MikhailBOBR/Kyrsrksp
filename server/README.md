# Server

Серверная часть приложения построена на `Node.js + Express + SQLite`.

Что уже есть:

- модули `auth`, `goals`, `products`, `meals`, `dashboard`;
- модули `hydration`, `templates`, `exports`;
- модули `checkins`, `metrics`, `planner`, `shopping`;
- JWT-аутентификация и ролевая модель `user/admin`;
- SQLite-база данных с инициализацией схемы и seed-данными;
- вычисление smart score, streak, achievements и рекомендаций;
- wellbeing check-in, body metrics, meal planner и shopping board;
- Swagger UI и OpenAPI JSON;
- API-тесты на `node:test`;
- раздача статических файлов клиентского интерфейса.

Следующий шаг для сервера - расширить доменную модель и перейти на PostgreSQL.



ВРОДЕ ЭТО ВСЕ НАРАБОТКИ ЗА ДЕНЬ И НОЧЬ
