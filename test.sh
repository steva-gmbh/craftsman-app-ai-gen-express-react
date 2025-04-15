#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Running CraftsmanApp Backend Tests ===${NC}"
echo

# Move to backend directory
cd modules/backend

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: Could not find backend package.json${NC}"
  exit 1
fi

echo -e "${YELLOW}=== Running Jest Unit Tests ===${NC}"
npm test
JEST_RESULT=$?

echo
echo -e "${YELLOW}=== Running Cucumber BDD Tests ===${NC}"
npm run test:cucumber
CUCUMBER_RESULT=$?

# Check results
if [ $JEST_RESULT -eq 0 ] && [ $CUCUMBER_RESULT -eq 0 ]; then
  echo
  echo -e "${GREEN}=== All tests passed successfully! ===${NC}"
  exit 0
else
  echo
  echo -e "${RED}=== Some tests failed. Please check the output above for details. ===${NC}"
  exit 1
fi 