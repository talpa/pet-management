#!/bin/bash

# Oracle Container Registry setup
# Replace with your Oracle Cloud details
REGION="us-ashburn-1"  # or your preferred region
TENANCY_NAMESPACE="your-tenancy-namespace"
REGISTRY="$REGION.ocir.io/$TENANCY_NAMESPACE"

# Build images
echo "Building Docker images..."

# Frontend
echo "Building frontend..."
cd ../frontend
docker build -t pet-frontend:latest -f Dockerfile.prod .

# Backend  
echo "Building backend..."
cd ../backend
docker build -t pet-backend:latest .

# Tag for Oracle Registry
docker tag pet-frontend:latest $REGISTRY/pet-frontend:latest
docker tag pet-backend:latest $REGISTRY/pet-backend:latest

# Login to Oracle Container Registry
echo "Logging in to Oracle Container Registry..."
# You'll need to create Auth Token in Oracle Cloud Console
# docker login $REGION.ocir.io -u "$TENANCY_NAMESPACE/your-username" -p "your-auth-token"

# Push images
echo "Pushing images to Oracle Registry..."
# docker push $REGISTRY/pet-frontend:latest
# docker push $REGISTRY/pet-backend:latest

echo "Done! Images ready for OKE deployment."