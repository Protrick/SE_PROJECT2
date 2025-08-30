#!/bin/bash

echo "Starting SE_PROJECT2 Development Environment..."

# Function to cleanup background processes
cleanup() {
    echo "Stopping development servers..."
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start server in background
echo "Starting server on port 5000..."
cd server
npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start client in background
echo "Starting client on port 5173..."
cd ../client
npm run dev &
CLIENT_PID=$!

echo ""
echo "🚀 Development environment is starting up..."
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
