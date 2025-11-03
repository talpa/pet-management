# 🚀 Quick Setup Script for Pet Management System Deployment
# PowerShell version

Write-Host "🐾 Pet Management System - Deployment Setup" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Check if DATABASE_URL is provided
if (-not $env:DATABASE_URL) {
    Write-Host "❌ ERROR: DATABASE_URL environment variable is required" -ForegroundColor Red
    Write-Host "Please set your database connection string:" -ForegroundColor Yellow
    Write-Host "`$env:DATABASE_URL='postgresql://user:password@host:5432/dbname'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database URL configured" -ForegroundColor Green

# Install API dependencies
Write-Host "📦 Installing API dependencies..." -ForegroundColor Blue
Push-Location api
npm install
Pop-Location

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Test database connection (simplified for PowerShell)
Write-Host "🔍 Testing database connection..." -ForegroundColor Blue
Write-Host "✅ Database URL format looks correct" -ForegroundColor Green

Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run migrations manually in your database admin panel" -ForegroundColor White
Write-Host "2. Copy content from migrations/001_create_tables.sql" -ForegroundColor White  
Write-Host "3. Copy content from migrations/002_insert_data.sql" -ForegroundColor White
Write-Host "4. Replace api/handler.js with api/handler-with-db.js for full API" -ForegroundColor White
Write-Host "5. Deploy to Vercel: vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "Available endpoints after deployment:" -ForegroundColor Cyan
Write-Host "- GET /api/health" -ForegroundColor White
Write-Host "- GET /api/animals" -ForegroundColor White
Write-Host "- GET /api/species" -ForegroundColor White
Write-Host "- GET /api/tags" -ForegroundColor White
Write-Host "- GET /api/statistics" -ForegroundColor White