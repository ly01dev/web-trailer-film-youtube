#!/bin/bash

echo "🔍 Checking MongoDB database..."

# Check if MongoDB container is running
if ! docker-compose ps | grep -q "mongodb.*Up"; then
    echo "❌ MongoDB container is not running"
    exit 1
fi

echo "✅ MongoDB container is running"

# Check databases
echo "📊 Listing databases:"
docker-compose exec mongodb mongosh --eval "db.adminCommand('listDatabases')" --quiet

# Check collections in phim-youtube database
echo "📋 Checking collections in phim-youtube database:"
docker-compose exec mongodb mongosh phim-youtube --eval "db.getCollectionNames()" --quiet

# Check movies count
echo "🎬 Checking movies count:"
docker-compose exec mongodb mongosh phim-youtube --eval "db.movies.countDocuments()" --quiet

# Check users count
echo "👥 Checking users count:"
docker-compose exec mongodb mongosh phim-youtube --eval "db.users.countDocuments()" --quiet

echo "✅ Database check completed" 