@echo off
REM SafeTravel - Quick Start for Windows
REM Run this to start the GPS Travel Alarm System

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║        SafeTravel - GPS-Based Smart Travel Alarm System          ║
echo ║                                                                   ║
echo ║                  🚀 Starting Application...                      ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Python is not installed!
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)

echo ✅ Python found:
python --version
echo.

REM Navigate to project directory
cd /d "%~dp0GPS_Travel_Alarm"
echo 📁 Working directory: %cd%
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    if %errorlevel% equ 0 (
        echo ✅ Virtual environment created
    ) else (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
)

echo.
echo 🔧 Activating virtual environment...

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo ❌ Could not find activation script
    pause
    exit /b 1
)

echo ✅ Virtual environment activated
echo.

REM Install/update dependencies
echo 📥 Installing dependencies from requirements.txt...
pip install -r requirements.txt >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ⚠️  Warning: Some dependencies may not have installed correctly
)

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║                  🎉 Starting Flask Server...                     ║
echo ║                                                                   ║
echo ║          Open your browser at: http://localhost:5000             ║
echo ║                                                                   ║
echo ║                    Press Ctrl+C to stop                          ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

REM Run Flask app
python app.py

pause
