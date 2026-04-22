# Wiki: Тестирование И Качество

## Наборы Проверок

- интеграционные API-тесты;
- негативные contract-тесты;
- smoke-проверки приложения и Swagger;
- unit-тесты validation/security;
- static-contract tests для фронтенда;
- fuzzing-сценарии.

## Основные Команды

```bash
npm test
npm run test:coverage
npm run test:fuzz
npm run check:client
```

## Где Смотреть

- [docs/05-testing-and-quality.md](../docs/05-testing-and-quality.md)
- [server/tests](../server/tests)
- [scripts/check-client.js](../scripts/check-client.js)

## Что Проверяется Отдельно

- JWT и парольная защита;
- ролевой доступ;
- экспорт отчётов;
- устойчивость к некорректным данным;
- стабильность критичных элементов фронтенда.
