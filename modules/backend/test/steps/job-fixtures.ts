import { Given } from '@cucumber/cucumber';
import { prisma } from '../support/test-app';

// Response storage
let testJobs: any[] = [];

// Given steps
Given('there is a job with ID {int} in the database', async function(id: number) {
  try {
    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id }
    });
    
    if (!existingJob) {
      // Get a customer for the job
      let customer = await prisma.customer.findFirst();
      
      // If no customer exists, create one
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: 'Test Customer',
            email: `testcustomer${Date.now()}@example.com`,
            phone: '555-123-4567'
          }
        });
      }
      
      // Create test job if doesn't exist
      const testJob = await prisma.job.create({
        data: {
          id,
          title: `Test Job ${id}`,
          description: `A test job with ID ${id}`,
          status: 'pending',
          price: 100.00,
          customerId: customer.id
        }
      });
      testJobs.push(testJob);
    } else {
      testJobs.push(existingJob);
    }
  } catch (error) {
    console.error(`Error setting up job ${id}:`, error);
    throw error;
  }
});

Given('the database is reset for job tests', async function() {
  // Delete all jobs created for tests
  try {
    // First find all test jobs
    const testJobIds = await prisma.job.findMany({
      where: {
        title: {
          contains: 'Test Job'
        }
      },
      select: {
        id: true
      }
    });
    
    // Delete job-tool associations using explicit IDs
    if (testJobIds.length > 0) {
      await prisma.jobTool.deleteMany({
        where: {
          jobId: {
            in: testJobIds.map(job => job.id)
          }
        }
      });
    }

    // Delete job-material associations using explicit IDs
    if (testJobIds.length > 0) {
      await prisma.jobMaterial.deleteMany({
        where: {
          jobId: {
            in: testJobIds.map(job => job.id)
          }
        }
      });
    }
    
    // Then delete the jobs
    await prisma.job.deleteMany({
      where: {
        title: {
          contains: 'Test Job'
        }
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}); 