# Stage 1 — builder
FROM node:20-alpine AS builder

RUN apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# Stage 2 — production
FROM node:20-alpine

RUN apk upgrade --no-cache && npm install -g npm@latest

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 8888

CMD ["node", "dist/server.js"]
