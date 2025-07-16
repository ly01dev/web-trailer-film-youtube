#!/bin/bash

echo "🚀 Deploying HTTPS fix for Phim YouTube..."

# Stop all containers
echo "📦 Stopping containers..."
docker-compose down

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Rebuild containers
echo "🔨 Rebuilding containers..."
docker-compose build --no-cache

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for containers to be healthy
echo "⏳ Waiting for containers to be healthy..."
sleep 30

# Check container status
echo "📊 Checking container status..."
docker-compose ps

# Test HTTP endpoints
echo "🔍 Testing HTTP endpoints..."
curl -f http://localhost/health || echo "❌ HTTP health check failed"
curl -f http://localhost/api/health || echo "❌ HTTP API health check failed"

# Test HTTPS endpoints (if SSL is configured)
echo "🔍 Testing HTTPS endpoints..."
curl -f -k https://localhost/health || echo "❌ HTTPS health check failed"
curl -f -k https://localhost/api/health || echo "❌ HTTPS API health check failed"

echo "✅ Deployment completed!"
echo "🌐 Frontend: https://film8x.xyz"
echo "🔗 API: https://film8x.xyz/api" 