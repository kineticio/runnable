# base node image
FROM node:16-bullseye-slim as base

RUN mkdir /app
WORKDIR /app

COPY . .

RUN npm install

ENV NODE_ENV=production

RUN npm run build

CMD ["node", "dist/main.js"]
