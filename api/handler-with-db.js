// Vercel serverless function - Full API handler with database support
const express = require('express');
const cors = require('cors');

let app = null;
let pool = null;

// Initialize database connection
function initDatabase() {
  if (!pool && process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

async function getApp() {
  if (!app) {
    app = express();
    
    // Enable CORS
    app.use(cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Initialize database connection
    const db = initDatabase();
    
    // Health check endpoint
    app.get('/api/health', async (req, res) => {
      try {
        let dbStatus = 'disconnected';
        if (db) {
          const result = await db.query('SELECT NOW()');
          dbStatus = result.rows ? 'connected' : 'error';
        }
        
        res.json({ 
          status: 'ok', 
          message: 'Vercel API is running',
          database: dbStatus,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: error.message,
          database: 'error'
        });
      }
    });
    
    // Public animals endpoint
    app.get('/api/animals', async (req, res) => {
      if (!db) {
        return res.status(503).json({ error: 'Database not available' });
      }
      
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const query = `
          SELECT a.*, s.name as species_name
          FROM animals a
          LEFT JOIN animal_species s ON a.species_id = s.id
          WHERE a.is_public = true
          ORDER BY a.created_at DESC
          LIMIT $1 OFFSET $2
        `;
        
        const result = await db.query(query, [limit, offset]);
        
        // Get total count
        const countResult = await db.query('SELECT COUNT(*) FROM animals WHERE is_public = true');
        const total = parseInt(countResult.rows[0].count);
        
        res.json({
          animals: result.rows,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch animals' });
      }
    });
    
    // Animal by SEO URL endpoint
    app.get('/api/animals/seo/:seoUrl', async (req, res) => {
      if (!db) {
        return res.status(503).json({ error: 'Database not available' });
      }
      
      try {
        const { seoUrl } = req.params;
        
        const query = `
          SELECT a.*, s.name as species_name
          FROM animals a
          LEFT JOIN animal_species s ON a.species_id = s.id
          WHERE a.seo_url = $1 AND a.is_public = true
        `;
        
        const result = await db.query(query, [seoUrl]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Animal not found' });
        }
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch animal' });
      }
    });
    
    // Animal species endpoint
    app.get('/api/species', async (req, res) => {
      if (!db) {
        return res.status(503).json({ error: 'Database not available' });
      }
      
      try {
        const result = await db.query('SELECT * FROM animal_species ORDER BY name');
        res.json(result.rows);
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch species' });
      }
    });
    
    // Animal tags endpoint
    app.get('/api/tags', async (req, res) => {
      if (!db) {
        return res.status(503).json({ error: 'Database not available' });
      }
      
      try {
        const result = await db.query('SELECT * FROM animal_tags ORDER BY name');
        res.json(result.rows);
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
      }
    });
    
    // Statistics endpoint
    app.get('/api/statistics', async (req, res) => {
      if (!db) {
        return res.status(503).json({ error: 'Database not available' });
      }
      
      try {
        // Get basic statistics
        const stats = await Promise.all([
          db.query('SELECT COUNT(*) as total_animals FROM animals'),
          db.query('SELECT COUNT(*) as total_users FROM users'),
          db.query('SELECT COUNT(*) as total_species FROM animal_species'),
          db.query('SELECT COUNT(*) as public_animals FROM animals WHERE is_public = true')
        ]);
        
        res.json({
          totalAnimals: parseInt(stats[0].rows[0].total_animals),
          totalUsers: parseInt(stats[1].rows[0].total_users),
          totalSpecies: parseInt(stats[2].rows[0].total_species),
          publicAnimals: parseInt(stats[3].rows[0].public_animals)
        });
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
      }
    });
    
    // Database info endpoint (admin)
    app.get('/api/admin/database-info', async (req, res) => {
      if (!db) {
        return res.status(503).json({ error: 'Database not available' });
      }
      
      try {
        const tables = await db.query(`
          SELECT table_name, 
                 (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
          FROM information_schema.tables t
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `);
        
        res.json({
          connected: true,
          tables: tables.rows,
          tableCount: tables.rows.length
        });
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to get database info' });
      }
    });
    
    // Error handler for undefined API routes
    app.use('/api/*', (req, res) => {
      res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.path,
        method: req.method,
        availableEndpoints: [
          'GET /api/health',
          'GET /api/animals',
          'GET /api/animals/seo/:seoUrl',
          'GET /api/species',
          'GET /api/tags',
          'GET /api/statistics',
          'GET /api/admin/database-info'
        ]
      });
    });
    
    // Catch all for non-API routes
    app.use('*', (req, res) => {
      res.status(404).json({ 
        error: 'Route not found',
        path: req.path 
      });
    });
    
    // Global error handler
    app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });
  }
  return app;
}

// Export the handler function that Vercel expects
module.exports = async function handler(req, res) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    // Get the initialized Express app
    const expressApp = await getApp();
    
    // Handle the request with Express app
    return expressApp(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }));
  }
};