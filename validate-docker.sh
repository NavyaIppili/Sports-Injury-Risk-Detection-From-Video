#!/bin/bash
# Docker Configuration Validation Script
# This script validates the Docker setup before running containers

echo "=== Docker Setup Validation ==="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "   Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✓ Docker is installed: $(docker --version)"

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "   Please start Docker Desktop"
    exit 1
fi

echo "✓ Docker daemon is running"
echo ""

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available"
    echo "   Please ensure Docker Desktop is installed (includes Compose)"
    exit 1
fi

echo "✓ Docker Compose is available: $(docker compose version)"
echo ""

# Check required files
echo "Checking configuration files..."
files=(
    "docker-compose.yml"
    "frontend/Dockerfile"
    "frontend/nginx.conf"
    "frontend/.env.production"
    "frontend/.dockerignore"
    "backend/Dockerfile"
    "backend/.dockerignore"
    ".env.docker"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "❌ $file - MISSING"
        all_exist=false
    fi
done

if [ "$all_exist" = false ]; then
    echo ""
    echo "❌ Some required files are missing"
    exit 1
fi

echo ""
echo "✓ All required configuration files exist"
echo ""

# Check Docker Compose syntax
echo "Validating docker-compose.yml syntax..."
if docker compose config > /dev/null 2>&1; then
    echo "✓ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has syntax errors"
    docker compose config
    exit 1
fi

echo ""
echo "=== Validation Complete ==="
echo ""
echo "All checks passed! You can now run:"
echo "  docker compose build"
echo "  docker compose up"
echo ""
