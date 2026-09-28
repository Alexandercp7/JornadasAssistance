# ─────────────────────────────────────────────
#  ETAPA 1: Instalar dependencias
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copiar manifests
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Instalar todas las dependencias (incluyendo devDeps para prisma generate)
RUN npm ci --legacy-peer-deps

# Generar el cliente Prisma
RUN npx prisma generate


# ─────────────────────────────────────────────
#  ETAPA 2: Build de Next.js
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Variable de entorno necesaria en build time
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npm run build


# ─────────────────────────────────────────────
#  ETAPA 3: Runtime (imagen final mínima)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copiar archivos necesarios del builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
