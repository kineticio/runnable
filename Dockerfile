# base node image
FROM node:16-bullseye-slim as base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

# Install PnPm
RUN npm install -g pnpm

RUN mkdir /app
WORKDIR /app

COPY . .

RUN pnpm install

ENV NODE_ENV=production

RUN pnpm -r run build

WORKDIR /app/packages/runnable-app

CMD ["pnpm", "dev:server"]
