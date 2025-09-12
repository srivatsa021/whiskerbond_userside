# ---- Frontend build (Vite) ----
FROM node:20-alpine AS build-frontend
WORKDIR /app

# Install deps (cached)
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Production deps for backend only ----
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# ---- Runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy backend source
COPY --from=build-frontend /app/server ./server
COPY --from=build-frontend /app/package.json ./package.json

# Copy built frontend into backend to serve as static files
# Place under server/public (commonly used by Express static middleware)
COPY --from=build-frontend /app/dist ./server/public

# Runtime directories
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5001

# Read env at runtime via dotenv; do not bake .env into image
CMD ["node", "server/index.cjs"]
