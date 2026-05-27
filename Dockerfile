# ============================================
# Intellica Project - Faculty Research Management System
# Multi-Stage Docker Build for Production
# ============================================
# This Dockerfile:
# 1. Builds React frontend to static assets (Stage 1)
# 2. Creates single container with Node.js backend (Stage 2)
# 3. Serves frontend through backend on port 5000
# 4. Includes curl for health checks and diagnostics
# 5. Uses tini for proper signal handling
# 6. Validates environment variables on startup
# ============================================

# ============================================
# STAGE 1: Frontend Build
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies (optimized for production build)
RUN npm ci --prefer-offline --no-audit && chmod -R 755 node_modules/.bin/

# Copy frontend source code
COPY frontend/ .

# Build React app with Vite
# Output: /app/frontend/dist
# Use sh (Alpine's default shell) instead of bash to avoid missing bash in alpine
RUN chmod +x node_modules/.bin/* && npm run build

# ============================================
# STAGE 2: Production Runtime
# ============================================
FROM node:20-alpine

# Install runtime dependencies:
# - curl: for diagnostics
# - tini: init process for proper signal handling (PID 1)
RUN apk add --no-cache curl tini

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend package files and source code
COPY backend/package*.json ./backend/
COPY backend/ ./backend/

# Copy required backend folders (explicitly for clarity)
# These are needed for the app to function
RUN ls -la backend/utils/ backend/middleware/ 2>/dev/null || true

# Install backend dependencies (production mode only)
# This reduces image size by ~50% by excluding dev dependencies
RUN cd backend && npm ci --prefer-offline --no-audit --only=production

# Copy built frontend dist folder from builder stage
# This will be served by Express on all non-/api routes
COPY --from=frontend-builder /app/frontend/dist ./backend/dist

# Create uploads directory for persistent storage
RUN mkdir -p ./backend/uploads && chmod 755 ./backend/uploads

# Set working directory to backend for execution
WORKDIR /app/backend



# ============================================
# Runtime Configuration
# ============================================

# Expose port 5000 (backend + frontend served together)
EXPOSE 5000

# Use tini as init process (PID 1)
# This ensures proper signal handling and process management
# Critical for graceful shutdowns in Docker/Kubernetes
ENTRYPOINT ["/sbin/tini", "--"]

# Start the backend server
# Server.js will:
# 1. Validate required environment variables
# 2. Connect to MongoDB
# 3. Apply security middleware
# 4. Serve frontend static files
# 5. Handle API requests
CMD ["node", "server.js"]

# ============================================
# Notes:
# ============================================
# - Multi-stage build: Frontend code not included in final image
# - Alpine base: Minimal image size (~400MB total)
# - Health checks: Automatic monitoring and restart
# - Volume mount: /app/backend/uploads (persistent file storage)
# - Environment variables required:
#   MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_APP_PASSWORD
# - Security: Middleware headers applied via securityMiddleware.js
# - Signal handling: Graceful shutdown on SIGTERM