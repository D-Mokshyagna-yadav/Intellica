@echo off
REM Docker Build & Test Script for Intellica Project (Windows)
REM Use this to test your Docker setup locally before deploying to Coolify

setlocal enabledelayedexpansion

echo.
echo ================================
echo Intellica Project Docker Build
echo ================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    exit /b 1
)

echo [SUCCESS] Docker found
echo.

REM Check if .env exists
if not exist .env (
    echo [WARNING] .env file not found
    echo Copying .env.example to .env
    copy .env.example .env
    echo [WARNING] Please update .env with your configuration
    echo.
)

echo Building Docker image...
echo.

REM Build the image
docker build ^
    -t intellica-app:latest ^
    .

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker build failed
    exit /b 1
)

echo.
echo [SUCCESS] Docker image built successfully
echo.

REM Show image details
echo Image Details:
docker images intellica-app:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.Created}}"

echo.
echo ================================
echo Image is ready for deployment!
echo ================================
echo.
echo To test locally, run:
echo   docker-compose up --build
echo.
echo To stop containers, run:
echo   docker-compose down
echo.
echo To push to Coolify:
echo   1. git add .
echo   2. git commit -m "Deploy: Ready for Coolify"
echo   3. git push origin main
echo.
