# Backend Dockerfile - Optimized Multi-Stage Build
# Stage 1: Build dependencies
FROM node:18-alpine AS builder
 
WORKDIR /app
 
# Copy package files
COPY package*.json ./
 
# Install dependencies
RUN npm ci --only=production
 
# Stage 2: Production image
FROM node:18-alpine
 
# Add security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
 
WORKDIR /app
 
# Copy dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
 
# Copy application code
COPY --chown=nodejs:nodejs . .
 
# Switch to non-root user
USER nodejs
 
# Expose port
EXPOSE 5000
 
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
 
# Start the server
CMD ["node", "server.js"]