#!/bin/bash
# Start backend
echo "Starting FastAPI backend..."
source venv/bin/activate
./venv/bin/python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "Starting Vite frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
