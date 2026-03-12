ARG NODE_VERSION=24.14.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /usr/src/app

FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS final
ENV NODE_ENV=production
USER node

COPY --chown=node:node package.json ./
COPY --from=prod-deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
