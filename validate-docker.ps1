# Docker Configuration Validation Script (PowerShell)
# This script validates the Docker setup before running containers

Write-Host "=== Docker Setup Validation ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
$dockerExists = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)
if ($dockerExists) {
    $dockerVersion = docker --version
    Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
}
else {
    Write-Host "⚠ Docker is not installed or not in PATH" -ForegroundColor Yellow
    Write-Host "   Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
}

Write-Host ""

# Check required files
Write-Host "Checking configuration files..." -ForegroundColor Cyan
$files = @(
    "docker-compose.yml",
    "frontend\Dockerfile",
    "frontend\nginx.conf",
    "frontend\.env.production",
    "frontend\.dockerignore",
    "backend\Dockerfile",
    "backend\.dockerignore",
    ".env.docker"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $file - MISSING" -ForegroundColor Red
        $allExist = $false
    }
}

if ($allExist) {
    Write-Host ""
    Write-Host "✓ All required configuration files exist" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "❌ Some required files are missing" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Validation Complete ===" -ForegroundColor Cyan
Write-Host ""

if ($dockerExists) {
    Write-Host "All checks passed! You can now run:" -ForegroundColor Green
    Write-Host "  docker compose build" -ForegroundColor Yellow
    Write-Host "  docker compose up" -ForegroundColor Yellow
}
else {
    Write-Host "All configuration files are ready!" -ForegroundColor Green
    Write-Host "Once you install Docker Desktop, run:" -ForegroundColor Cyan
    Write-Host "  docker compose build" -ForegroundColor Yellow
    Write-Host "  docker compose up" -ForegroundColor Yellow
}
Write-Host ""

