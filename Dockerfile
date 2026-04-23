FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production \
    APP_ENV=production \
    SERVER_HOST=0.0.0.0 \
    SERVER_PORT=8080 \
    DB_PATH=/data/app.db

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY client ./client
COPY server ./server

RUN mkdir -p /data && chown -R node:node /app /data

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/health >/dev/null 2>&1 || exit 1

CMD ["node", "server/src/cli.js", "server"]
