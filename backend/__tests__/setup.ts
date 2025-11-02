// Global test setup
import { sequelize } from '../src/config/database';

// Setup before all tests
beforeAll(async () => {
  // Set test environment
  (process.env as any).NODE_ENV = 'test';
  
  // Connect to test database
  try {
    await sequelize.authenticate();
    console.log('✅ Test database connection established');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  await sequelize.close();
  console.log('🔄 Test database connection closed');
});