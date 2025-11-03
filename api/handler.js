// Vercel serverless function wrapper for backend API  
const { IncomingMessage, ServerResponse } = require('http');

let app = null;

// Vercel serverless function - minimal API handler
const express = require('express');
const cors = require('cors');

let app = null;

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
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        message: 'Vercel API is running',
        timestamp: new Date().toISOString()
      });
    });
    
    // Test endpoint
    app.get('/api/test', (req, res) => {
      res.json({ 
        message: 'Test endpoint working',
        env: process.env.NODE_ENV || 'development'
      });
    });
    
    // Default handler for other API routes
    app.use('/api/*', (req, res) => {
      res.status(501).json({ 
        error: 'API endpoint not implemented in Vercel deployment',
        path: req.path,
        method: req.method,
        message: 'This is a simplified API for Vercel. Full backend runs in Docker.'
      });
    });
    
    // Catch all for non-API routes
    app.use('*', (req, res) => {
      res.status(404).json({ 
        error: 'Route not found',
        path: req.path 
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
      stack: error.stack 
    }));
  }
};