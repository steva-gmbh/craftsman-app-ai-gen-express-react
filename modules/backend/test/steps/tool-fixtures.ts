import { Given } from '@cucumber/cucumber';
import { prisma } from '../support/test-app';

// Response storage
let testTools: any[] = [];

// Given steps
Given('there is a tool with ID {int} in the database', async function(id: number) {
  try {
    // Check if tool exists
    const existingTool = await prisma.tool.findUnique({
      where: { id }
    });
    
    if (!existingTool) {
      // Create test tool if doesn't exist
      const testTool = await prisma.tool.create({
        data: {
          id,
          name: `Test Tool ${id}`,
          category: 'Plumbing',
          brand: 'TestBrand',
          model: 'TestModel',
          location: 'Workshop'
        }
      });
      testTools.push(testTool);
    } else {
      testTools.push(existingTool);
    }
  } catch (error) {
    console.error(`Error setting up tool ${id}:`, error);
    throw error;
  }
});

Given('the database is reset for tool tests', async function() {
  // Delete all tools created for tests
  try {
    // First delete any job-tool associations
    await prisma.jobTool.deleteMany({
      where: {
        tool: {
          name: {
            contains: 'Test Tool'
          }
        }
      }
    });
    
    // Then delete the tools
    await prisma.tool.deleteMany({
      where: {
        name: {
          contains: 'Test Tool'
        }
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}); 