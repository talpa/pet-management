#!/bin/bash

# 🧪 OAuth Test Script
# Testuje dostupnost OAuth endpointů a konfiguraci

echo "🔍 Testing OAuth Configuration..."
echo "=================================="

# Test 1: Backend API dostupnost
echo ""
echo "1️⃣ Testing Backend API accessibility..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4444/api/health 2>/dev/null || echo "FAIL")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend API: ONLINE (http://localhost:4444)"
else
    echo "❌ Backend API: OFFLINE (Status: $BACKEND_STATUS)"
    echo "   💡 Run: docker-compose up backend"
fi

# Test 2: Frontend dostupnost  
echo ""
echo "2️⃣ Testing Frontend accessibility..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>/dev/null || echo "FAIL")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: ONLINE (http://localhost:8080)"
else
    echo "❌ Frontend: OFFLINE (Status: $FRONTEND_STATUS)"
    echo "   💡 Run: docker-compose up frontend"
fi

# Test 3: Google OAuth endpoint
echo ""
echo "3️⃣ Testing Google OAuth endpoint..."
GOOGLE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4444/api/auth/google 2>/dev/null || echo "FAIL")
if [ "$GOOGLE_STATUS" = "302" ]; then
    echo "✅ Google OAuth: CONFIGURED (redirects to Google)"
else
    echo "❌ Google OAuth: MISCONFIGURED (Status: $GOOGLE_STATUS)"
    echo "   💡 Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"
fi

# Test 4: Facebook OAuth endpoint
echo ""
echo "4️⃣ Testing Facebook OAuth endpoint..."
FACEBOOK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4444/api/auth/facebook 2>/dev/null || echo "FAIL")
if [ "$FACEBOOK_STATUS" = "302" ]; then
    echo "✅ Facebook OAuth: CONFIGURED (redirects to Facebook)"
else
    echo "❌ Facebook OAuth: MISCONFIGURED (Status: $FACEBOOK_STATUS)"
    echo "   💡 Check FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in .env"
fi

# Test 5: Environment variables
echo ""
echo "5️⃣ Checking environment variables..."
if [ -f "backend/.env" ]; then
    echo "✅ backend/.env: EXISTS"
    
    # Check required variables
    if grep -q "GOOGLE_CLIENT_ID=" backend/.env && [ $(grep "GOOGLE_CLIENT_ID=" backend/.env | cut -d'=' -f2 | wc -c) -gt 20 ]; then
        echo "✅ GOOGLE_CLIENT_ID: SET"
    else
        echo "❌ GOOGLE_CLIENT_ID: MISSING or INVALID"
    fi
    
    if grep -q "FACEBOOK_APP_ID=" backend/.env && [ $(grep "FACEBOOK_APP_ID=" backend/.env | cut -d'=' -f2 | wc -c) -gt 10 ]; then
        echo "✅ FACEBOOK_APP_ID: SET"
    else
        echo "❌ FACEBOOK_APP_ID: MISSING or INVALID"
    fi
    
    if grep -q "CLIENT_URL=http://localhost:8080" backend/.env; then
        echo "✅ CLIENT_URL: CORRECT"
    else
        echo "❌ CLIENT_URL: INCORRECT (should be http://localhost:8080)"
    fi
else
    echo "❌ backend/.env: MISSING"
    echo "   💡 Copy backend/.env.example to backend/.env"
fi

# Test 6: Docker containers
echo ""
echo "6️⃣ Checking Docker containers..."
if command -v docker-compose &> /dev/null; then
    CONTAINERS=$(docker-compose ps --services --filter "status=running" 2>/dev/null || echo "")
    if echo "$CONTAINERS" | grep -q "backend"; then
        echo "✅ Backend container: RUNNING"
    else
        echo "❌ Backend container: NOT RUNNING"
    fi
    
    if echo "$CONTAINERS" | grep -q "frontend"; then
        echo "✅ Frontend container: RUNNING"
    else
        echo "❌ Frontend container: NOT RUNNING"
    fi
    
    if echo "$CONTAINERS" | grep -q "postgres"; then
        echo "✅ Database container: RUNNING"
    else
        echo "❌ Database container: NOT RUNNING"
    fi
else
    echo "❌ Docker Compose: NOT AVAILABLE"
fi

# Summary
echo ""
echo "📋 SUMMARY"
echo "=========="
echo "🌐 Frontend URL: http://localhost:8080"
echo "🔧 Backend API: http://localhost:4444/api"
echo "🔐 Google OAuth: http://localhost:4444/api/auth/google"
echo "📘 Facebook OAuth: http://localhost:4444/api/auth/facebook"
echo ""
echo "📖 Complete setup guide: ./OAUTH_SETUP_GUIDE.md"
echo ""

# Quick start commands
echo "🚀 QUICK START COMMANDS"
echo "======================="
echo "🐳 Start all services:     docker-compose up --build"
echo "🔄 Restart backend:        docker-compose restart backend"
echo "📱 Open application:       open http://localhost:8080"
echo "🔍 View backend logs:      docker-compose logs backend -f"
echo "🎯 Test OAuth manually:    open http://localhost:4444/api/auth/google"