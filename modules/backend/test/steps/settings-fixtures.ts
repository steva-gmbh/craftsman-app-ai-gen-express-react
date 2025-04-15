import { Given } from '@cucumber/cucumber';
import { prisma } from '../support/test-app';

// Response storage
let testSettings: any[] = [];
let testUsers: any[] = [];

// Given steps
Given('there is a user with ID {int} in the database', async function(id: number) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      // Create test user if doesn't exist
      const testUser = await prisma.user.create({
        data: {
          id,
          name: `Test User ${id}`,
          email: `test${id}@example.com`,
          password: 'password123',
          role: 'user'
        }
      });
      testUsers.push(testUser);
    } else {
      testUsers.push(existingUser);
    }
  } catch (error) {
    console.error(`Error setting up user ${id}:`, error);
    throw error;
  }
});

Given('user {int} has settings in the database', async function(userId: number) {
  try {
    // Make sure user exists first
    // Instead of using this.given which might not be available, 
    // directly call the function that creates the user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      // Create test user if doesn't exist
      await prisma.user.create({
        data: {
          id: userId,
          name: `Test User ${userId}`,
          email: `test${userId}@example.com`,
          password: 'password123',
          role: 'user'
        }
      });
    }
    
    // Check if settings exist
    const existingSettings = await prisma.settings.findUnique({
      where: { userId }
    });
    
    if (!existingSettings) {
      // Create test settings if they don't exist
      const settingsData = await prisma.settings.create({
        data: {
          userId,
          profile: JSON.stringify({ name: `Test User ${userId}`, email: `test${userId}@example.com` }),
          business: JSON.stringify({ name: 'Test Business', services: ['Test Service 1', 'Test Service 2'] }),
          billing: JSON.stringify({ taxRate: 20, currency: 'USD' }),
          notifications: JSON.stringify({ email: true, sms: false }),
          appearance: JSON.stringify({ theme: 'light' }),
          pagination: JSON.stringify({ rowsPerPage: 10 })
        }
      });
      testSettings.push(settingsData);
    } else {
      testSettings.push(existingSettings);
    }
  } catch (error) {
    console.error(`Error setting up settings for user ${userId}:`, error);
    throw error;
  }
});

Given('the database is reset for settings tests', async function() {
  // Delete all test settings
  try {
    // Find all settings related to test users and delete them
    const testUserIds = await prisma.user.findMany({
      where: {
        email: {
          contains: 'test'
        }
      },
      select: {
        id: true
      }
    });
    
    const ids = testUserIds.map(user => user.id);
    
    if (ids.length > 0) {
      await prisma.settings.deleteMany({
        where: {
          userId: {
            in: ids
          }
        }
      });
    }
    
    // Reset test arrays
    testSettings = [];
    
    // For safety, we don't delete test users here as they might be used by other tests,
    // but just reset our array
    testUsers = [];
  } catch (error) {
    console.error('Error resetting database for settings tests:', error);
  }
}); 