import { Router } from 'express';
import { sequelize } from '../config/database';

const router = Router();

// Debug endpoint pro testování databázového připojení
router.get('/health', async (req, res) => {
  try {
    // Test databázového připojení
    await sequelize.authenticate();
    
    // Zkus získat seznam tabulek
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    res.json({
      status: 'success',
      database: 'connected',
      tables: results,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
      }
    });
  }
});

// Endpoint pro vytvoření tabulek
router.post('/sync-database', async (req, res) => {
  try {
    await sequelize.sync({ force: false, alter: true });
    res.json({ 
      status: 'success', 
      message: 'Database synchronized successfully' 
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;