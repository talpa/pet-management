// Vercel serverless function wrapper for backend API  
const { IncomingMessage, ServerResponse } = require('http');

let app = null;

async function getApp() {
  if (!app) {
    try {
      // Simple require without TypeScript complications
      const expressApp = require('../backend/src/server.ts');
      app = expressApp.default || expressApp;
    } catch (error) {
      console.error('Failed to load Express app:', error);
      throw error;
    }
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