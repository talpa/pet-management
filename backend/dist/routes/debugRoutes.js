"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
router.get('/health', async (req, res) => {
    try {
        await database_1.sequelize.authenticate();
        const [results] = await database_1.sequelize.query(`
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
    }
    catch (error) {
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
router.post('/sync-database', async (req, res) => {
    try {
        await database_1.sequelize.sync({ force: false, alter: true });
        res.json({
            status: 'success',
            message: 'Database synchronized successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});
exports.default = router;
