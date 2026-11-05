# Build from the repository root:  docker build -f apps/api/Dockerfile -t ridean-api .
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/web-core/package.json packages/web-core/
COPY apps/api/package.json apps/api/
COPY apps/website/package.json apps/website/
COPY apps/pwa/package.json apps/pwa/
COPY apps/admin/package.json apps/admin/
RUN npm ci --workspace @ridean/shared --workspace @ridean/api --include-workspace-root
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build -w @ridean/shared && npm run build -w @ridean/api

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared/package.json packages/shared/
COPY --from=build /repo/packages/shared/dist packages/shared/dist
COPY --from=build /repo/apps/api/package.json apps/api/
COPY --from=build /repo/apps/api/dist apps/api/dist
COPY --from=build /repo/apps/api/drizzle apps/api/drizzle
WORKDIR /repo/apps/api
EXPOSE 4000
# Apply migrations, then start
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/main.js"]
