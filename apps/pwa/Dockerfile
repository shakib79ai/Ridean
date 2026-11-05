# Build from the repository root:
#   docker build -f apps/pwa/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t ridean-pwa .
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
RUN npm ci --workspace @ridean/pwa --include-workspace-root
COPY packages packages
COPY apps/pwa apps/pwa
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w @ridean/shared && npm run build -w @ridean/pwa

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3001 HOSTNAME=0.0.0.0
COPY --from=build /repo/apps/pwa/.next/standalone ./
COPY --from=build /repo/apps/pwa/.next/static ./apps/pwa/.next/static
COPY --from=build /repo/apps/pwa/public ./apps/pwa/public
EXPOSE 3001
CMD ["node", "apps/pwa/server.js"]
