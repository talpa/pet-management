// Vercel serverless function wrapper for backend API
import { IncomingMessage, ServerResponse } from 'http';

let app: any = null;

async function getApp() {
  if (!app) {
    // Import and initialize the Express app
    const { default: expressApp } = await import('../src/server');
    
    // Initialize database connection for serverless
    const { sequelize } = await import('../src/config/database');
    
    try {
      await sequelize.authenticate();
      console.log('Database connection established for serverless.');
      await sequelize.sync({ force: false });
      console.log('Database synchronized for serverless.');
    } catch (error) {
      console.error('Database initialization error:', error);
    }
    
    app = expressApp;
  }
  return app;
}

// Export the handler function that Vercel expects
export default async function handler(req: IncomingMessage & { query: any; cookies: any; body: any }, res: ServerResponse & { status: (code: number) => any; json: (obj: any) => any; end: () => void; setHeader: (name: string, value: string) => void }) {
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
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}