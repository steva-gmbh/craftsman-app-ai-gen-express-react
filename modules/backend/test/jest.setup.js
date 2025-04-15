const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

// Set test database environment variable for integration tests
process.env.DATABASE_URL = 'file:./test.db';

// Before all tests run, make sure test database is migrated
beforeAll(async () => {
  // Only run database migration if not running in CI environment
  // and not running unit tests (which use mocks)
  if (!process.env.CI && process.env.TEST_TYPE !== 'unit') {
    try {
      // Create a test database using schema push
      execSync('npx prisma db push --accept-data-loss', { 
        env: { ...process.env, DATABASE_URL: 'file:./test.db' } 
      });
      console.log('Test database schema applied successfully');
      
      // Set up global prisma connection for integration tests
      global.prisma = new PrismaClient();
    } catch (error) {
      console.error('Error applying test database schema:', error);
      throw error;
    }
  }
});

// Clean up after all tests
afterAll(async () => {
  // Only disconnect if we created a connection
  if (global.prisma) {
    // Close any open connections
    await global.prisma.$disconnect();
  }
}); 