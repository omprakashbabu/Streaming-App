# Frontend Dockerfile - Optimized
FROM nginx:alpine
 
# Add security: remove default nginx user and create new one
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001
 
# Copy frontend files to nginx html directory
COPY --chown=nginx-app:nginx-app . /usr/share/nginx/html/
 
# Copy custom nginx configuration
COPY --chown=nginx-app:nginx-app nginx.conf /etc/nginx/conf.d/default.conf
 
# Remove default nginx configs
RUN rm -f /etc/nginx/conf.d/default.conf.default
 
# Expose port 80
EXPOSE 80
 
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
 
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
 