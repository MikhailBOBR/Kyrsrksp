FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production \
    APP_ENV=production \
    SERVER_HOST=0.0.0.0 \
    PORT=8080 \
    DB_PATH=/data/app.db

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --omit=optional && npm cache clean --force

COPY client ./client
COPY scripts ./scripts
COPY server ./server

RUN mkdir -p /data && chown -R node:node /app /data

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const port=process.env.SERVER_PORT||process.env.PORT||8080; fetch('http://127.0.0.1:'+port+'/api/ready').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server/src/cli.js", "server"]
