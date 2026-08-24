@echo off
REM Docker Configuration Validation Script (Windows Batch)

echo === Docker Setup Validation ===
echo.

REM Check required files
echo Checking configuration files...
set allExist=1

if not exist "docker-compose.yml" (
    echo [X] docker-compose.yml - MISSING
    set allExist=0
) else (
    echo [OK] docker-compose.yml
)

if not exist "frontend\Dockerfile" (
    echo [X] frontend\Dockerfile - MISSING
    set allExist=0
) else (
    echo [OK] frontend\Dockerfile
)

if not exist "frontend\nginx.conf" (
    echo [X] frontend\nginx.conf - MISSING
    set allExist=0
) else (
    echo [OK] frontend\nginx.conf
)

if not exist "frontend\.env.production" (
    echo [X] frontend\.env.production - MISSING
    set allExist=0
) else (
    echo [OK] frontend\.env.production
)

if not exist "frontend\.dockerignore" (
    echo [X] frontend\.dockerignore - MISSING
    set allExist=0
) else (
    echo [OK] frontend\.dockerignore
)

if not exist "backend\Dockerfile" (
    echo [X] backend\Dockerfile - MISSING
    set allExist=0
) else (
    echo [OK] backend\Dockerfile
)

if not exist "backend\.dockerignore" (
    echo [X] backend\.dockerignore - MISSING
    set allExist=0
) else (
    echo [OK] backend\.dockerignore
)

if not exist ".env.docker" (
    echo [X] .env.docker - MISSING
    set allExist=0
) else (
    echo [OK] .env.docker
)

echo.

if "%allExist%"=="0" (
    echo [ERROR] Some required files are missing
    exit /b 1
)

echo [OK] All required configuration files exist
echo.
echo === Validation Complete ===
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Docker is installed!
    echo.
    echo You can now run:
    echo   docker compose build
    echo   docker compose up
) else (
    echo Docker not found in PATH
    echo.
    echo Once you install Docker Desktop, run:
    echo   docker compose build
    echo   docker compose up
)
echo.
