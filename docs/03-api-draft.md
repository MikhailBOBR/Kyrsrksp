# Черновик API

Ниже приведён стартовый набросок будущего REST API. Это не финальная спецификация, а рабочая основа для дальнейшей детализации.

## Auth

- `POST /api/auth/register` - регистрация пользователя.
- `POST /api/auth/login` - вход в систему.
- `POST /api/auth/refresh` - обновление токена.
- `POST /api/auth/logout` - выход из системы.

## Profile

- `GET /api/profile` - получить профиль текущего пользователя.
- `PUT /api/profile` - обновить профиль.
- `PUT /api/profile/goals` - обновить дневные цели по КБЖУ.

## Products

- `GET /api/products` - получить список продуктов.
- `POST /api/products` - создать продукт.
- `GET /api/products/{id}` - получить продукт по идентификатору.
- `PUT /api/products/{id}` - обновить продукт.
- `DELETE /api/products/{id}` - удалить продукт.

## Meals

- `GET /api/meals` - получить приёмы пищи за период.
- `POST /api/meals` - создать приём пищи.
- `GET /api/meals/{id}` - получить приём пищи.
- `PUT /api/meals/{id}` - обновить приём пищи.
- `DELETE /api/meals/{id}` - удалить приём пищи.

## Reports

- `GET /api/reports/daily` - сводка за день.
- `GET /api/reports/weekly` - сводка за неделю.
- `GET /api/reports/monthly` - сводка за месяц.

## Следующий шаг

После выбора стека и модели данных этот файл можно превратить в полноценную OpenAPI-спецификацию.
