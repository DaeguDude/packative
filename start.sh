#!/bin/bash

set -e

echo "🚀 Starting Propotive development environment..."

# Copy .env.example to .env if .env doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker compose up --build

echo "✅ Development environment is ready!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
