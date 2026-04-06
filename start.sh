#!/bin/bash
 
echo "================================"
echo " StreamVault Docker Startup"
echo "================================"
echo ""
 
# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running!"
    echo "Please start Docker first:"
    echo "  sudo systemctl start docker"
    echo ""
    exit 1
fi
 
echo "✅ Docker is running..."
echo ""
 
# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ ERROR: docker-compose is not installed!"
    echo "Install it with:"
    echo "  sudo apt-get install docker-compose"
    echo ""
    exit 1
fi
 
echo "✅ docker-compose found..."
echo ""
 
# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down
echo ""
 
# Build and start containers
echo "🚀 Building and starting containers..."
echo "This may take a few minutes on first run..."
echo ""
docker-compose up --build
 
# Script will stay running until Ctrl+C