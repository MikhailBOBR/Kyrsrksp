FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY client ./client
COPY server ./server

ENV SERVER_PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
