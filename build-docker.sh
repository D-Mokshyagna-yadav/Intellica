#!/bin/bash
# Docker Build & Test Script for Intellica Project
# Use this to test your Docker setup locally before deploying to Coolify

set -e

echo "================================"
echo "Intellica Project Docker Build"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker found${NC}"
echo ""

# Load environment variables
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Using .env.example as template${NC}"
    cp .env.example .env
    echo -e "${YELLOW}   Please update .env with your configuration${NC}"
fi

echo "Building Docker image..."
echo ""

# Build the image
docker build \
    -t intellica-app:latest \
    -t intellica-app:$(date +%Y%m%d_%H%M%S) \
    .

echo ""
echo -e "${GREEN}✅ Docker image built successfully${NC}"
echo ""

# Show image details
echo "Image Details:"
docker images intellica-app:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.Created}}"

echo ""
echo "================================"
echo "Image is ready for deployment!"
echo "================================"
echo ""
echo "To test locally, run:"
echo "  docker-compose up --build"
echo ""
echo "To stop containers, run:"
echo "  docker-compose down"
echo ""
echo "To push to Coolify:"
echo "  git add ."
echo "  git commit -m 'Deploy: Ready for Coolify'"
echo "  git push origin main"
echo ""
