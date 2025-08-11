#!/bin/bash

# DEFIMON Equity Token - Security Audit System Startup Script
# This script will start the AI-powered security audit system

echo "🚀 Starting DEFIMON Security Audit System..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "📝 Please edit .env file with your OpenAI API key and other configuration"
        echo "🔑 You need to add: OPENAI_API_KEY=your_api_key_here"
        read -p "Press Enter after you've configured .env file..."
    else
        echo "❌ env.example not found. Please create .env file manually with:"
        echo "OPENAI_API_KEY=your_openai_api_key_here"
        exit 1
    fi
fi

# Check if OpenAI API key is configured
if ! grep -q "OPENAI_API_KEY=" .env || grep -q "OPENAI_API_KEY=your_openai_api_key_here" .env; then
    echo "❌ OpenAI API key not configured in .env file"
    echo "Please add: OPENAI_API_KEY=your_actual_api_key_here"
    exit 1
fi

echo "✅ Environment configuration verified"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ Dependencies installed"

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Frontend built successfully"

# Start the server
echo "🚀 Starting security audit server..."
echo "📍 Server will be available at: http://localhost:3001"
echo "🔒 Security Auditor will be available at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start
