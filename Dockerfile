FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci --workspace=backend

FROM deps AS build
COPY backend ./backend
RUN npm run db:generate --workspace=backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/backend ./backend
COPY package.json package-lock.json ./

WORKDIR /app/backend
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4000/health/live || exit 1

CMD ["node", "src/server.js"]
