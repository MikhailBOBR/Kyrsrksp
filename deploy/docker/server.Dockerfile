FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY client ./client
COPY server ./server

EXPOSE 8080

CMD ["npm", "start"]
