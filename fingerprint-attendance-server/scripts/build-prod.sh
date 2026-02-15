#!/bin/bash

# Build script for production
echo "Starting production build..."

# Install dependencies
npm install --omit=dev

# Run migrations (Optional: better run manually during deployment)
# npm run migration:run

# Build NestJS
npm run build

echo "Build completed successfully!"
