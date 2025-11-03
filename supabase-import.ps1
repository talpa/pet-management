# 🚀 Supabase Import Script pro Pet Management System

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl,
    [switch]$SkipConfirmation
)

Write-Host "🐾 Pet Management System - Supabase Import" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# Validate database URL format
if ($DatabaseUrl -notmatch "^postgresql://postgres:.*@db\..*\.supabase\.co:5432/postgres$") {
    Write-Host "❌ Invalid Supabase database URL format!" -ForegroundColor Red
    Write-Host "Expected format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase database URL format is valid" -ForegroundColor Green

# Extract project info from URL
$projectRef = ($DatabaseUrl -split "@db\.")[1].Split(".")[0]
Write-Host "📋 Project Reference: $projectRef" -ForegroundColor Cyan

# Check if psql is available
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL client (psql) is available" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  psql not found - you'll need to use Supabase SQL Editor" -ForegroundColor Yellow
    Write-Host "Download PostgreSQL tools from: https://www.postgresql.org/download/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Migration files to import:" -ForegroundColor Blue
Write-Host "1. migrations/001_create_tables.sql (Schema)" -ForegroundColor White
Write-Host "2. migrations/002_insert_data.sql (Sample data)" -ForegroundColor White
Write-Host ""

if (-not $SkipConfirmation) {
    $confirm = Read-Host "Continue with import? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "❌ Import cancelled" -ForegroundColor Red
        exit 0
    }
}

# Set environment variable
$env:DATABASE_URL = $DatabaseUrl

Write-Host "🔄 Starting migration import..." -ForegroundColor Blue

# Try to import via psql
try {
    Write-Host "📋 Importing schema (001_create_tables.sql)..." -ForegroundColor Yellow
    psql $DatabaseUrl -f "migrations/001_create_tables.sql" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Schema imported successfully" -ForegroundColor Green
        
        Write-Host "📋 Importing sample data (002_insert_data.sql)..." -ForegroundColor Yellow
        psql $DatabaseUrl -f "migrations/002_insert_data.sql" 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Sample data imported successfully" -ForegroundColor Green
            $importSuccess = $true
        } else {
            Write-Host "⚠️  Sample data import had issues - check manually" -ForegroundColor Yellow
            $importSuccess = $false
        }
    } else {
        Write-Host "❌ Schema import failed" -ForegroundColor Red
        $importSuccess = $false
    }
} catch {
    Write-Host "❌ psql import failed - use manual import method" -ForegroundColor Red
    $importSuccess = $false
}

Write-Host ""

if ($importSuccess) {
    Write-Host "🎉 Import completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Verify data in Supabase Table Editor" -ForegroundColor White
    Write-Host "2. Disable RLS for public tables (see SUPABASE-SETUP.md)" -ForegroundColor White
    Write-Host "3. Set DATABASE_URL in Vercel environment variables" -ForegroundColor White
    Write-Host "4. Activate full API: cp api/handler-with-db.js api/handler.js" -ForegroundColor White
    Write-Host "5. Deploy: vercel --prod" -ForegroundColor White
} else {
    Write-Host "⚠️  Automatic import failed - use manual method:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual import steps:" -ForegroundColor Cyan
    Write-Host "1. Open Supabase dashboard: https://app.supabase.com" -ForegroundColor White
    Write-Host "2. Go to SQL Editor" -ForegroundColor White
    Write-Host "3. Copy & paste content from migrations/001_create_tables.sql" -ForegroundColor White
    Write-Host "4. Run the query" -ForegroundColor White
    Write-Host "5. Copy & paste content from migrations/002_insert_data.sql" -ForegroundColor White
    Write-Host "6. Run the query" -ForegroundColor White
}

Write-Host ""
Write-Host "📊 Expected tables after import:" -ForegroundColor Blue
@(
    "animals (3 records)",
    "animal_species (7 records)", 
    "animal_tags (8 records)",
    "permissions (12 records)",
    "user_groups (4 records)",
    "users (empty)",
    "animal_images (empty)",
    "statistics (empty)"
) | ForEach-Object {
    Write-Host "  ✓ $_" -ForegroundColor White
}

Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor Blue
Write-Host "  Supabase Dashboard: https://app.supabase.com/project/$projectRef" -ForegroundColor White
Write-Host "  Table Editor: https://app.supabase.com/project/$projectRef/editor" -ForegroundColor White
Write-Host "  SQL Editor: https://app.supabase.com/project/$projectRef/sql" -ForegroundColor White