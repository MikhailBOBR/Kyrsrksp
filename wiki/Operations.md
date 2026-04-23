# Operations

## Run

```bash
npm install
npm start
```

## Migrate

```bash
npm run migrate
docker compose --profile ops run --rm migrate
```

## Create admin manually

```bash
npm run create-admin -- --email=admin@example.com --password=Admin123! --name="Admin User"
```

## Docker

```bash
docker compose up --build
```

## Checks

```bash
npm run check:client
npm test
npm run pre-release
```
