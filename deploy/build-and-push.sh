#!/bin/bash

# Simple production build and push script
echo "🚀 Building production image..."

docker compose -f docker-compose.prod.yml build frontend

echo "📦 Pushing to Docker Hub..."
docker push elitekaycy/project:scalestash.io.web.latest

echo "✅ Production image built and pushed!"
echo "Image: elitekaycy/project:scalestash.io.web.latest"