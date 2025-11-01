#!/bin/bash

# Vercel build script pro frontend
echo "🔨 Building frontend for Vercel..."

cd frontend

# Install dependencies
npm ci

# Build React app
npm run build

echo "✅ Frontend build complete!"