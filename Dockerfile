# Multi-stage build para optimizar tamaño de imagen
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

# ============================================
# Stage 1: Dependencies
# ============================================
FROM base AS deps

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then \
      npm ci || npm install; \
    else \
      npm install; \
    fi

# ============================================
# Stage 2: Builder
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables NEXT_PUBLIC_* se inyectan en BUILD TIME
ARG NEXT_PUBLIC_API_URL=http://localhost:3001

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ============================================
# Stage 3: Runner (Producción)
# ============================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/', (r) => {process.exit(r.statusCode >= 200 && r.statusCode < 400 ? 0 : 1)})"

CMD ["node", "server.js"]
