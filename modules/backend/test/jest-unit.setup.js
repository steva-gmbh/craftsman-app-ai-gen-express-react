// This setup file is specifically for unit tests
// It ensures we're using mocks and not connecting to the actual database

// Mark as unit test environment
process.env.TEST_TYPE = 'unit';

// Force in-memory database URL to prevent accidental connections
process.env.DATABASE_URL = 'file::memory:';

// Setup global mocks if needed
beforeAll(() => {
  console.log('Setting up mocked environment for unit tests');
  
  // Create mock PrismaClient to catch any unexpected database calls
  jest.mock('@prisma/client', () => {
    const originalModule = jest.requireActual('@prisma/client');
    return {
      __esModule: true,
      ...originalModule,
      PrismaClient: jest.fn(() => {
        const throwError = () => {
          throw new Error('Database access attempted in unit tests. Use mocks instead.');
        };
        
        return {
          $connect: throwError,
          $disconnect: jest.fn(),
          $transaction: throwError
        };
      })
    };
  });
});

// Clean up any mocks
afterAll(() => {
  console.log('Cleaning up mocked environment');
}); 