#!/bin/bash
echo "🚀 Starting Big Appetite Food Cost Calculator API..."
echo "📊 API will be available at: http://localhost:8000"
echo "📖 API documentation at: http://localhost:8000/docs"
echo "🛑 Press Ctrl+C to stop the server"
echo ""
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
