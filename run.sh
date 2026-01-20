#!/usr/bin/env bash
# SafeTravel - Quick Start Script
# Run this to start the GPS Travel Alarm System

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║        SafeTravel - GPS-Based Smart Travel Alarm System          ║"
echo "║                                                                   ║"
echo "║                  🚀 Starting Application...                      ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Error: Python is not installed!"
        echo "Please install Python 3.8 or higher from https://www.python.org/"
        exit 1
    fi
    PYTHON="python"
else
    PYTHON="python3"
fi

echo "✅ Python found: $($PYTHON --version)"
echo ""

# Navigate to project directory
cd "$(dirname "$0")/GPS_Travel_Alarm"
echo "📁 Working directory: $(pwd)"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    $PYTHON -m venv venv
    if [ $? -eq 0 ]; then
        echo "✅ Virtual environment created"
    else
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
fi

echo ""
echo "🔧 Activating virtual environment..."

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    echo "❌ Could not find activation script"
    exit 1
fi

echo "✅ Virtual environment activated"
echo ""

# Install/update dependencies
echo "📥 Installing dependencies from requirements.txt..."
pip install -r requirements.txt > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "⚠️  Warning: Some dependencies may not have installed correctly"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║                  🎉 Starting Flask Server...                     ║"
echo "║                                                                   ║"
echo "║          Open your browser at: http://localhost:5000             ║"
echo "║                                                                   ║"
echo "║                    Press Ctrl+C to stop                          ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Run Flask app
$PYTHON app.py
