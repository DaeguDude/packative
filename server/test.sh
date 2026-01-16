#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

CONTAINER_NAME="propotive-test-db"
TEST_DB_PORT=5433
TEST_DB_USER="test"
TEST_DB_PASSWORD="test"
TEST_DB_NAME="propotive_test"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cleanup() {
  echo -e "${YELLOW}Cleaning up test database...${NC}"
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true
}

# Cleanup on exit (success or failure)
trap cleanup EXIT

# Remove any existing test container
cleanup

echo -e "${GREEN}Starting test database container...${NC}"
docker run -d --name $CONTAINER_NAME \
  -e POSTGRES_USER=$TEST_DB_USER \
  -e POSTGRES_PASSWORD=$TEST_DB_PASSWORD \
  -e POSTGRES_DB=$TEST_DB_NAME \
  -p $TEST_DB_PORT:5432 \
  postgres:15

echo -e "${YELLOW}Waiting for database to be ready...${NC}"
until docker exec $CONTAINER_NAME pg_isready -U $TEST_DB_USER -d $TEST_DB_NAME > /dev/null 2>&1; do
  sleep 1
done
echo -e "${GREEN}Database is ready!${NC}"

# Set test database URL
export DATABASE_URL="postgresql://${TEST_DB_USER}:${TEST_DB_PASSWORD}@localhost:${TEST_DB_PORT}/${TEST_DB_NAME}"

echo -e "${YELLOW}Pushing Prisma schema to test database...${NC}"
cd "$PROJECT_ROOT"
npx prisma db push --schema=prisma/schema.prisma --skip-generate

echo -e "${GREEN}Running tests...${NC}"
cd "$SCRIPT_DIR"
npm run test:run

echo -e "${GREEN}Tests completed!${NC}"
