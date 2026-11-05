# Build from the repository root:
#   docker build -f apps/admin/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t ridean-admin .
# NEXT_PUBLIC_* values are baked in at build time.
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/web-core/package.json packages/web-core/
COPY apps/api/package.json apps/api/
COPY apps/website/package.json apps/website/
COPY apps/pwa/package.json apps/pwa/
COPY apps/admin/package.json apps/admin/
RUN npm ci --workspace @ridean/admin --include-workspace-root
COPY packages packages
COPY apps/admin apps/admin
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w @ridean/shared && npm run build -w @ridean/admin

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3002 HOSTNAME=0.0.0.0
COPY --from=build /repo/apps/admin/.next/standalone ./
COPY --from=build /repo/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build /repo/apps/admin/public ./apps/admin/public
EXPOSE 3002
CMD ["node", "apps/admin/server.js"]
