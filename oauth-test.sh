#!/bin/bash

echo "🔧 OAuth Diagnostic Tool"
echo "========================"

# Check if backend is running
echo "1. Checking backend health..."
curl -s http://localhost:5000/api/health || echo "❌ Backend not responding"

echo -e "\n2. Testing OAuth endpoints..."

# Test Google OAuth redirect
echo "🔵 Google OAuth:"
curl -s -I http://localhost:5000/api/auth/google | head -1 || echo "❌ Google OAuth endpoint not working"

# Test Facebook OAuth redirect  
echo "🔵 Facebook OAuth:"
curl -s -I http://localhost:5000/api/auth/facebook | head -1 || echo "❌ Facebook OAuth endpoint not working"

# Test Microsoft OAuth redirect
echo "🔵 Microsoft OAuth:"
curl -s -I http://localhost:5000/api/auth/microsoft | head -1 || echo "❌ Microsoft OAuth endpoint not working"

echo -e "\n3. Checking environment variables..."
if docker-compose exec backend printenv | grep -E "(GOOGLE_CLIENT_ID|FACEBOOK_APP_ID|MICROSOFT_CLIENT_ID)" > /dev/null; then
    echo "✅ OAuth environment variables are set"
else
    echo "❌ OAuth environment variables missing"
fi

echo -e "\n4. Database check..."
docker-compose exec postgres psql -U postgres -d fullstack_db -c "SELECT COUNT(*) as users_count FROM users;" 2>/dev/null || echo "❌ Database connection issue"

echo -e "\n🔧 Quick fixes if OAuth isn't working:"
echo "- Check .env file has real OAuth credentials (not placeholder values)"
echo "- Verify redirect URIs in OAuth provider console match: http://localhost:5000/api/auth/{provider}/callback"
echo "- Restart containers: docker-compose down && docker-compose up --build"
echo "- Check backend logs: docker-compose logs backend"