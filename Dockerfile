# -----------------------------
# Stage 1: Build Stage
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies install karein
COPY package*.json ./
RUN npm ci

# Source code copy karein aur build karein
COPY . .
RUN npm run build

# -----------------------------
# Stage 2: Production Runtime
# -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Sirf production dependencies install karein
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Builder stage se sirf compiled dist folder copy karein
COPY --from=builder /app/dist ./dist

# Security ke liye non-root user use karein
USER node

# Port expose karein
EXPOSE 4000

# Production app run karein
CMD ["node", "dist/main.js"]
