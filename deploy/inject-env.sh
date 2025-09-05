#!/bin/sh

echo "🔄 Injecting runtime environment variables..."

# Replace placeholders with actual environment variables in built JS files
find /app/dist -name "*.js" -type f -exec sed -i \
  -e "s|__VITE_API_BASE_URL__|${VITE_API_BASE_URL}|g" \
  -e "s|__VITE_CLOUDINARY_CLOUD_NAME__|${VITE_CLOUDINARY_CLOUD_NAME}|g" \
  -e "s|__VITE_CLOUDINARY_API_URL__|${VITE_CLOUDINARY_API_URL}|g" \
  -e "s|__VITE_BACKEND_BASE_URL__|${VITE_BACKEND_BASE_URL}|g" \
  -e "s|__VITE_SUPABASE_URL__|${VITE_SUPABASE_URL}|g" \
  -e "s|__VITE_SUPABASE_ANON_KEY__|${VITE_SUPABASE_ANON_KEY}|g" \
  -e "s|__VITE_SUPABASE_AUTH_TOKEN_KEY__|${VITE_SUPABASE_AUTH_TOKEN_KEY}|g" \
  -e "s|__VITE_APP_URL__|${VITE_APP_URL}|g" \
  -e "s|__VITE_S3_ENDPOINT__|${VITE_S3_ENDPOINT}|g" \
  -e "s|__VITE_S3_REGION__|${VITE_S3_REGION}|g" \
  -e "s|__VITE_S3_ACCESS_KEY_ID__|${VITE_S3_ACCESS_KEY_ID}|g" \
  -e "s|__VITE_S3_SECRET_ACCESS_KEY__|${VITE_S3_SECRET_ACCESS_KEY}|g" \
  -e "s|__VITE_S3_BUCKET_NAME__|${VITE_S3_BUCKET_NAME}|g" \
  -e "s|__VITE_S3_FORCE_PATH_STYLE__|${VITE_S3_FORCE_PATH_STYLE}|g" \
  -e "s|__VITE_S3_USE_SSL__|${VITE_S3_USE_SSL}|g" \
  -e "s|__VITE_S3_PORT__|${VITE_S3_PORT}|g" \
  {} \;

echo "✅ Environment variables injected successfully!"

# Start the server
echo "🚀 Starting server..."
serve -s dist -l 5173