#!/bin/bash

echo "🚀 Setting up and running production Docker locally..."

# Create .env.prod file in deploy directory
echo "📝 Creating .env.prod file..."
cat > .env.prod << 'EOF'
VITE_API_BASE_URL=http://192.168.100.64:8000
VITE_CLOUDINARY_CLOUD_NAME=dnuyuq1sd
VITE_CLOUDINARY_API_URL=https://api.cloudinary.com/v1_1
VITE_BACKEND_BASE_URL=http://192.168.100.64:8000
VITE_SUPABASE_URL=https://bhdbjtlzfoyzslhzkplu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZGJqdGx6Zm95enNsaHprcGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTY0ODcsImV4cCI6MjA2NzQ3MjQ4N30.paGB_hXQH09ja-kMFWzvJB96npCX3uRXFcpzF-UlTgw
VITE_SUPABASE_AUTH_TOKEN_KEY=sb-bhdbjtlzfoyzslhzkplu-auth-token
VITE_APP_URL=https://dev.app.scalestash.com
VITE_S3_ENDPOINT=http://192.168.100.64:9000
VITE_S3_REGION=us-east-1
VITE_S3_ACCESS_KEY_ID=minioadmin
VITE_S3_SECRET_ACCESS_KEY=minioadmin
VITE_S3_BUCKET_NAME=scale-app
VITE_S3_FORCE_PATH_STYLE=true
VITE_S3_USE_SSL=false
VITE_S3_PORT=9000
EOF

echo "✅ .env.prod created successfully"

# Run docker compose
echo "🐳 Starting production Docker container..."
docker compose -f docker-compose.prod.yml up -d

echo "✅ Production container is running!"
echo "🌐 Access your app at: http://localhost:5173"
echo ""
echo "📋 Useful commands:"
echo "  View logs:    docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop:         docker compose -f docker-compose.prod.yml down"
echo "  Restart:      docker compose -f docker-compose.prod.yml restart"