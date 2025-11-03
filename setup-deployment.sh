#!/bin/bash

# 🚀 Quick Setup Script for Pet Management System Deployment

echo "🐾 Pet Management System - Deployment Setup"
echo "==========================================="

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is required"
    echo "Please set your database connection string:"
    echo "export DATABASE_URL='postgresql://user:password@host:5432/dbname'"
    exit 1
fi

echo "✅ Database URL configured"

# Install API dependencies
echo "📦 Installing API dependencies..."
cd api && npm install

# Test database connection
echo "🔍 Testing database connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connection successful');
    console.log('📅 Server time:', res.rows[0].now);
    pool.end();
  }
});
"

if [ $? -eq 0 ]; then
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run migrations: psql \$DATABASE_URL < migrations/001_create_tables.sql"
    echo "2. Add sample data: psql \$DATABASE_URL < migrations/002_insert_data.sql"
    echo "3. Deploy to Vercel: vercel --prod"
    echo ""
    echo "For full database API, replace api/handler.js with api/handler-with-db.js"
else
    echo "❌ Setup failed - please check your database configuration"
    exit 1
fi