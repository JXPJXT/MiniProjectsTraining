@echo off
echo ========================================
echo  Vintage Bike Generator - Local Setup
echo  Optimized for RTX 3050 6GB
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Please install Python 3.10+
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo [INFO] Installing requirements...
pip install -r requirements.txt --quiet

REM Run Streamlit
echo.
echo ========================================
echo  Starting Streamlit App...
echo  Open: http://localhost:8501
echo ========================================
echo.

streamlit run app_streamlit.py --server.port 8501 --server.headless false

pause
