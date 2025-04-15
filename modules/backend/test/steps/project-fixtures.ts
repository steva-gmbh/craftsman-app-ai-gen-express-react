import { Given } from '@cucumber/cucumber';
import { prisma } from '../support/test-app';

// Response storage
let testProjects: any[] = [];

// Given steps for project setup
Given('there is a project with ID {int} in the database', async function(id: number) {
  try {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!existingProject) {
      // First, make sure a customer exists for the project
      let customerId = 1;
      const customerExists = await prisma.customer.findUnique({
        where: { id: customerId }
      });
      
      if (!customerExists) {
        // Create a test customer if necessary
        await prisma.customer.create({
          data: {
            id: customerId,
            name: `Test Customer ${customerId}`,
            email: `test${customerId}@example.com`,
            phone: '555-123-4567',
            address: '123 Test Street'
          }
        });
      }
      
      // Create test project if it doesn't exist
      const testProject = await prisma.project.create({
        data: {
          id,
          name: `Test Project ${id}`,
          description: `Description for test project ${id}`,
          status: 'active',
          budget: 10000.00,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          customerId: customerId
        }
      });
      testProjects.push(testProject);
    } else {
      testProjects.push(existingProject);
    }
  } catch (error) {
    console.error(`Error setting up project ${id}:`, error);
    throw error;
  }
});

Given('there is a project with ID {int} in the database with a job ID {int}', async function(projectId: number, jobId: number) {
  try {
    // Set up the project
    let project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      // First, make sure a customer exists for the project
      let customerId = 1;
      const customerExists = await prisma.customer.findUnique({
        where: { id: customerId }
      });
      
      if (!customerExists) {
        // Create a test customer if necessary
        await prisma.customer.create({
          data: {
            id: customerId,
            name: `Test Customer ${customerId}`,
            email: `test${customerId}@example.com`,
            phone: '555-123-4567',
            address: '123 Test Street'
          }
        });
      }
      
      // Create test project
      project = await prisma.project.create({
        data: {
          id: projectId,
          name: `Test Project ${projectId}`,
          description: `Description for test project ${projectId}`,
          status: 'active',
          budget: 10000.00,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          customerId: customerId
        }
      });
    }
    
    // Check if the job exists
    let job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    
    if (!job) {
      // Create the job if it doesn't exist
      job = await prisma.job.create({
        data: {
          id: jobId,
          title: `Test Job ${jobId}`,
          description: `Description for test job ${jobId}`,
          status: 'pending',
          price: 1000.00,
          startDate: new Date('2023-03-01'),
          endDate: new Date('2023-04-01'),
          customerId: 1,
          projectId: projectId // Link to the project
        }
      });
    } else if (job.projectId !== projectId) {
      // Update the job to link it to this project if not already linked
      await prisma.job.update({
        where: { id: jobId },
        data: { projectId: projectId }
      });
    }
    
    testProjects.push(project);
  } catch (error) {
    console.error(`Error setting up project ${projectId} with job ${jobId}:`, error);
    throw error;
  }
});

// Renamed to avoid conflict with the job fixture step
Given('there is a job for project testing with ID {int} in the database', async function(id: number) {
  try {
    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id }
    });
    
    if (!existingJob) {
      // First, make sure a customer exists for the job
      let customerId = 1;
      const customerExists = await prisma.customer.findUnique({
        where: { id: customerId }
      });
      
      if (!customerExists) {
        // Create a test customer if necessary
        await prisma.customer.create({
          data: {
            id: customerId,
            name: `Test Customer ${customerId}`,
            email: `test${customerId}@example.com`,
            phone: '555-123-4567',
            address: '123 Test Street'
          }
        });
      }
      
      // Create test job if it doesn't exist
      await prisma.job.create({
        data: {
          id,
          title: `Test Job ${id}`,
          description: `Description for test job ${id}`,
          status: 'pending',
          price: 1000.00,
          startDate: new Date('2023-03-01'),
          endDate: new Date('2023-04-01'),
          customerId: customerId
        }
      });
    }
  } catch (error) {
    console.error(`Error setting up job ${id}:`, error);
    throw error;
  }
});

Given('the database is reset for project tests', async function() {
  // Delete test projects and jobs (in test environment)
  try {
    // Delete jobs related to test projects
    await prisma.job.deleteMany({
      where: {
        title: {
          contains: 'Test Job'
        }
      }
    });
    
    // Delete test projects
    await prisma.project.deleteMany({
      where: {
        name: {
          contains: 'Test Project'
        }
      }
    });
  } catch (error) {
    console.error('Error resetting database for project tests:', error);
  }
}); 