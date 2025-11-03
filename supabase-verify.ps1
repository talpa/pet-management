# 🔍 Supabase Verification Script

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl
)

Write-Host "🔍 Verifying Supabase Database Import" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$env:DATABASE_URL = $DatabaseUrl

# Test queries to verify import
$testQueries = @(
    @{
        name = "Animal Species Count"
        query = "SELECT COUNT(*) as count FROM animal_species;"
        expected = 7
    },
    @{
        name = "Animal Tags Count" 
        query = "SELECT COUNT(*) as count FROM animal_tags;"
        expected = 8
    },
    @{
        name = "Permissions Count"
        query = "SELECT COUNT(*) as count FROM permissions;"
        expected = 12
    },
    @{
        name = "User Groups Count"
        query = "SELECT COUNT(*) as count FROM user_groups;"
        expected = 4
    },
    @{
        name = "Sample Animals Count"
        query = "SELECT COUNT(*) as count FROM animals;"
        expected = 3
    }
)

$allPassed = $true

foreach ($test in $testQueries) {
    Write-Host "🔄 Testing: $($test.name)..." -ForegroundColor Yellow
    
    try {
        $result = psql $DatabaseUrl -t -c $test.query 2>$null
        if ($LASTEXITCODE -eq 0) {
            $count = [int]($result.Trim())
            if ($count -eq $test.expected) {
                Write-Host "  ✅ PASS: Found $count records (expected $($test.expected))" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  WARNING: Found $count records (expected $($test.expected))" -ForegroundColor Yellow
                $allPassed = $false
            }
        } else {
            Write-Host "  ❌ FAIL: Query failed" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        Write-Host "  ❌ FAIL: Connection error" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""

if ($allPassed) {
    Write-Host "🎉 All verification tests PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Your Supabase database is ready for production!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Final steps:" -ForegroundColor Yellow
    Write-Host "1. Set DATABASE_URL in Vercel: $DatabaseUrl" -ForegroundColor White
    Write-Host "2. Activate API: cp api/handler-with-db.js api/handler.js" -ForegroundColor White
    Write-Host "3. Deploy: vercel --prod" -ForegroundColor White
} else {
    Write-Host "⚠️  Some verification tests failed" -ForegroundColor Yellow
    Write-Host "Check your migrations and try importing again" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Quick data preview:" -ForegroundColor Blue

# Show sample data
$previewQueries = @(
    "SELECT name FROM animal_species LIMIT 3;",
    "SELECT name, color FROM animal_tags LIMIT 3;", 
    "SELECT name, description FROM animals LIMIT 3;"
)

foreach ($query in $previewQueries) {
    Write-Host "🔍 $query" -ForegroundColor Cyan
    try {
        $result = psql $DatabaseUrl -c $query 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host $result -ForegroundColor White
        }
    } catch {
        Write-Host "  Query failed" -ForegroundColor Red
    }
    Write-Host ""
}