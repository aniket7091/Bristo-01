# ── Stage 1: Install production dependencies ────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package manifests first for better Docker layer caching
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev


# ── Stage 2: Final runtime image ────────────────────────────────────────────
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling and su-exec for dropping privileges
RUN apk add --no-cache dumb-init su-exec

# Create a non-root user for security
RUN addgroup -S bristo && adduser -S bristo -G bristo

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Copy entrypoint used to prepare writable Docker volumes
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Set ownership
RUN chown -R bristo:bristo /app \
  && chmod +x /usr/local/bin/docker-entrypoint.sh

# Start as root so the entrypoint can fix mounted volume permissions, then drop privileges
USER root

# Application port
EXPOSE 5000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Use dumb-init as PID 1
ENTRYPOINT ["dumb-init", "--", "docker-entrypoint.sh"]

# Start application
CMD ["node", "server.js"]
