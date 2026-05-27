@echo off
echo Starting Intellica Project...

echo.
echo Starting Backend Server...
cd backend
start cmd /k "node server.js"

timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
cd ../frontend
start cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend will automatically find an available port (starting from 5000)
echo Frontend will automatically find an available port (starting from 5173)
echo.
echo Check the console windows for the actual URLs.
echo Press any key to exit this launcher...
pause > nul