#!/bin/bash

# Script deploy tự động cho VPS
# Sử dụng: ./deploy.sh [production|development]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="phim-youtube"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENVIRONMENT=${1:-development}

echo -e "${GREEN}🚀 Starting deployment for $PROJECT_NAME ($ENVIRONMENT)${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans

# Remove old images (optional)
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
    docker system prune -f
fi

# Build and start containers
echo -e "${YELLOW}🔨 Building and starting containers...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f $DOCKER_COMPOSE_FILE --profile production up -d --build
else
    docker-compose -f $DOCKER_COMPOSE_FILE up -d --build
fi

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"

# Check MongoDB
if docker-compose -f $DOCKER_COMPOSE_FILE ps mongodb | grep -q "Up"; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${RED}❌ MongoDB is not running${NC}"
    exit 1
fi

# Check Backend
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is running${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
    exit 1
fi

# Check Frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
    exit 1
fi

# Show running containers
echo -e "${GREEN}📊 Current running containers:${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE ps

# Show logs
echo -e "${GREEN}📋 Recent logs:${NC}"
docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Frontend: http://localhost:80${NC}"
echo -e "${GREEN}🔧 Backend API: http://localhost:5000${NC}"
echo -e "${GREEN}🗄️  MongoDB: localhost:27017${NC}"

# Optional: Show resource usage
echo -e "${YELLOW}💾 Resource usage:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 