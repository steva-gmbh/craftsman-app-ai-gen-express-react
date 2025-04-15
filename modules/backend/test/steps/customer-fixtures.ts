import { Given } from '@cucumber/cucumber';
import { prisma } from '../support/test-app';

// Response storage
let testCustomers: any[] = [];

// Given steps
Given('there is a customer with ID {int} in the database', async function(id: number) {
  try {
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });
    
    if (!existingCustomer) {
      // Create test customer if doesn't exist
      const testCustomer = await prisma.customer.create({
        data: {
          id,
          name: `Test Customer ${id}`,
          email: `test${id}@example.com`,
          phone: '555-123-4567',
          address: '123 Test Street'
        }
      });
      testCustomers.push(testCustomer);
    } else {
      testCustomers.push(existingCustomer);
    }
  } catch (error) {
    console.error(`Error setting up customer ${id}:`, error);
    throw error;
  }
});

Given('the database is reset for customer tests', async function() {
  // Delete all customers (in test environment)
  try {
    // Only delete test customers that were created for tests
    await prisma.customer.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}); 