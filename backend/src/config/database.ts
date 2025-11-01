import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create Sequelize instance with DATABASE_URL or individual config
const sequelize = process.env.DATABASE_URL 
  ? (() => {
      try {
        // Parse DATABASE_URL manually to handle special characters
        const url = new URL(process.env.DATABASE_URL!);
        return new Sequelize({
          dialect: 'postgres',
          host: url.hostname,
          port: parseInt(url.port) || 5432,
          database: url.pathname.slice(1), // Remove leading slash
          username: url.username,
          password: url.password,
          logging: process.env.NODE_ENV === 'development' ? console.log : false,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false
            }
          }
        });
      } catch (error) {
        console.log('Failed to parse DATABASE_URL, falling back to individual config');
        return new Sequelize({
          dialect: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'fullstack_db',
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          logging: process.env.NODE_ENV === 'development' ? console.log : false,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        });
      }
    })()
  : new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'fullstack_db',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

export { sequelize };