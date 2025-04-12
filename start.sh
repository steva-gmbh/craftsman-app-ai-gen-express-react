#!/bin/bash

# Exit on error
set -e

# Print commands as they are executed
set -x

# Parse command line arguments
SEED_DB=false
for arg in "$@"
do
    case $arg in
        --seed)
        SEED_DB=true
        shift
        ;;
    esac
done

# Change to backend directory
cd modules/backend

# Run migrations
echo "Running database migrations..."
npm run migrate

# Seed the database if --seed flag is provided
if [ "$SEED_DB" = true ]; then
    echo "Seeding the database..."
    npm run seed
else
    echo "Skipping database seeding. Use --seed to seed the database."
fi

# Start backend server in background
echo "Starting backend server..."
npx ts-node-dev --respawn --transpile-only src/server.ts &
BACKEND_PID=$!

# Change to frontend directory
cd ../frontend

# Start frontend server in background
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Function to clean up processes on script exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 