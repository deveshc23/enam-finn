@echo off
echo ========================================================
echo   FINN: Financial Investment Agent (ENAM Challenge)
echo ========================================================
echo.
echo Starting FastAPI Backend on http://localhost:8000 ...
start "FINN Backend" cmd /k "cd /d %~dp0backend && ..\venv\Scripts\python run.py"

timeout /t 3 /nobreak >nul

echo Starting Next.js Frontend on http://localhost:3000 ...
start "FINN Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================================
echo Both services launched!
echo Access the mobile prototype at: http://localhost:3000
echo ========================================================
pause
