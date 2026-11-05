# Build from the repository root:
#   docker build -f apps/website/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t ridean-website .
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
RUN npm ci --workspace @ridean/website --include-workspace-root
COPY packages packages
COPY apps/website apps/website
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w @ridean/shared && npm run build -w @ridean/website

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /repo/apps/website/.next/standalone ./
COPY --from=build /repo/apps/website/.next/static ./apps/website/.next/static
COPY --from=build /repo/apps/website/public ./apps/website/public
EXPOSE 3000
CMD ["node", "apps/website/server.js"]
