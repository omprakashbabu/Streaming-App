#!/bin/bash
 
echo "================================"
echo " StreamVault Docker Cleanup"
echo "================================"
echo ""
echo "⚠️  WARNING: This will remove all containers and volumes!"
echo "⚠️  Your database data will be DELETED!"
echo ""
read -p "Are you sure? (yes/no): " confirm
 
if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi
 
echo ""
echo "🗑️  Stopping and removing containers..."
docker-compose down -v
 
echo ""
echo "🧹 Cleaning up Docker images..."
docker image prune -f
 
echo ""
echo "✅ Cleanup complete!"
echo ""
 