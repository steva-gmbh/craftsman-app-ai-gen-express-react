import { Given } from '@cucumber/cucumber';
import { prisma } from '../support/test-app';

// Response storage
let testMaterials: any[] = [];

// Given steps
Given('there is a material with ID {int} in the database', async function(id: number) {
  try {
    // Check if material exists
    const existingMaterial = await prisma.material.findUnique({
      where: { id }
    });
    
    if (!existingMaterial) {
      // Create test material if doesn't exist
      const testMaterial = await prisma.material.create({
        data: {
          id,
          name: `Test Material ${id}`,
          description: `A test material with ID ${id}`,
          category: 'Test Category',
          unit: 'pcs',
          costPerUnit: 9.99,
          stock: 50,
          minStock: 10
        }
      });
      testMaterials.push(testMaterial);
    } else {
      testMaterials.push(existingMaterial);
    }
  } catch (error) {
    console.error(`Error setting up material ${id}:`, error);
    throw error;
  }
});

Given('the database is reset for material tests', async function() {
  // Delete all materials created for tests
  try {
    // First delete any job-material associations
    await prisma.jobMaterial.deleteMany({
      where: {
        material: {
          name: {
            contains: 'Test Material'
          }
        }
      }
    });
    
    // Then delete the materials
    await prisma.material.deleteMany({
      where: {
        name: {
          contains: 'Test Material'
        }
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}); 