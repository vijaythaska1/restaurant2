# -----------------------------
# Stage 1: Dependencies
# -----------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# pnpm ka exact version install karein (taaki version switch / native binary error na aaye)
RUN npm install -g pnpm@10.30.3

# Dependencies files copy karein
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# -----------------------------
# Stage 2: Builder
# -----------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN npm install -g pnpm@10.30.3

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build time par environment variable set karein (agar zaroorat ho)


RUN pnpm run build

# -----------------------------
# Stage 3: Runner (Production)
# -----------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Bahar ke browser access ke liye 0.0.0.0 zaroori hai
ENV HOSTNAME="0.0.0.0"

# Non-root user create karein security ke liye
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Public aur standalone files copy karein
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Standalone server start karein
CMD ["node", "server.js"]
