# Multi-stage build for React/Vite application
# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies with production optimizations
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_API_URL
ARG VITE_BACKEND_BASE_URL
ARG VITE_SUPABASE_AUTH_TOKEN_KEY

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_API_URL=$VITE_CLOUDINARY_API_URL
ENV VITE_BACKEND_BASE_URL=$VITE_BACKEND_BASE_URL
ENV VITE_SUPABASE_AUTH_TOKEN_KEY=$VITE_SUPABASE_AUTH_TOKEN_KEY

# Build the application
RUN npm run build

# Stage 2: Production stage with Nginx
FROM nginx:1.25-alpine AS production

# Install security updates
RUN apk upgrade --no-cache

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx user for security
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001

# Set proper permissions
RUN chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    chown -R nginx-app:nginx-app /var/log/nginx && \
    chown -R nginx-app:nginx-app /etc/nginx/conf.d

# Create pid directory
RUN mkdir -p /var/run/nginx && \
    chown -R nginx-app:nginx-app /var/run/nginx

# Switch to non-root user
USER nginx-app

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
