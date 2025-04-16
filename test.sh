#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Save original directory
ORIGINAL_DIR=$(pwd)

# Backend tests
echo -e "${YELLOW}=== Running CraftsmanApp Backend Tests ===${NC}"
echo

# Move to backend directory
cd modules/backend

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: Could not find backend package.json${NC}"
  exit 1
fi

echo -e "${YELLOW}=== Setting up test database ===${NC}"
# Set DATABASE_URL to test.db for migrations
export DATABASE_URL="file:./test.db"
# Create or reset the test database (for integration tests)
npx prisma db push --accept-data-loss > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Test database setup successful${NC}"
else
  echo -e "${RED}Failed to set up test database${NC}"
  exit 1
fi

# Set common test environment variables
export NODE_ENV=test

echo
echo -e "${YELLOW}=== Running Jest Unit Tests ===${NC}"
# For unit tests, we're using mocks so we don't need the actual DB
npm test
JEST_RESULT=$?

echo
echo -e "${YELLOW}=== Running Cucumber BDD Tests ===${NC}"
npm run test:cucumber
CUCUMBER_RESULT=$?

# Return to the original directory for frontend tests
cd $ORIGINAL_DIR

# Frontend tests
echo
echo -e "${YELLOW}=== Running CraftsmanApp Frontend Tests ===${NC}"
echo

# Move to frontend directory
cd modules/frontend

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: Could not find frontend package.json${NC}"
  exit 1
fi

echo
echo -e "${YELLOW}=== Running Cucumber Frontend Tests ===${NC}"
# Run frontend tests with auto-start enabled (make sure it's explicitly set to true)
export AUTO_START_FRONTEND=true
echo -e "${YELLOW}Auto-starting frontend server: AUTO_START_FRONTEND=${AUTO_START_FRONTEND}${NC}"
npm test
FRONTEND_TEST_RESULT=$?

# Return to the original directory
cd $ORIGINAL_DIR

# Check all results
if [ $JEST_RESULT -eq 0 ] && [ $CUCUMBER_RESULT -eq 0 ] && [ $FRONTEND_TEST_RESULT -eq 0 ]; then
  echo
  echo -e "${GREEN}=== All tests passed successfully! ===${NC}"
  exit 0
else
  echo
  echo -e "${RED}=== Some tests failed. Please check the output above for details. ===${NC}"
  exit 1
fi 