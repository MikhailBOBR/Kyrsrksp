FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY client ./client
COPY server ./server

EXPOSE 8080

CMD ["node", "server/src/index.js"]
