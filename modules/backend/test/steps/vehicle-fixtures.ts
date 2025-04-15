import { Given } from '@cucumber/cucumber';
import { prisma } from '../support/test-app';

// Response storage
let testVehicles: any[] = [];

// Given steps
Given('there is a vehicle with ID {int} in the database', async function(id: number) {
  try {
    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    
    if (!existingVehicle) {
      // Create test vehicle if doesn't exist
      const testVehicle = await prisma.vehicle.create({
        data: {
          id,
          name: `Test Vehicle ${id}`,
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          type: 'sedan',
          licensePlate: `TEST-${id}`,
          color: 'Silver',
          status: 'active'
        }
      });
      testVehicles.push(testVehicle);
    } else {
      testVehicles.push(existingVehicle);
    }
  } catch (error) {
    console.error(`Error setting up vehicle ${id}:`, error);
    throw error;
  }
});

Given('the database is reset for vehicle tests', async function() {
  // Delete all vehicles (in test environment)
  try {
    // Only delete test vehicles that were created for tests
    await prisma.vehicle.deleteMany({
      where: {
        name: {
          contains: 'Test Vehicle'
        }
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}); 