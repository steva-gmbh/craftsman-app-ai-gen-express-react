import { Given } from '@cucumber/cucumber';
import { prisma } from '../support/test-app';

// Response storage
let testJobMaterials: any[] = [];

// Given steps
Given('there is a job-material association with job ID {int} and material ID {int}', async function(jobId: number, materialId: number) {
  try {
    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    
    // Check if material exists
    const material = await prisma.material.findUnique({
      where: { id: materialId }
    });
    
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    if (!material) {
      throw new Error(`Material with ID ${materialId} not found`);
    }
    
    // Check if association already exists
    const existingJobMaterial = await prisma.jobMaterial.findFirst({
      where: {
        jobId,
        materialId
      }
    });
    
    if (!existingJobMaterial) {
      // Create test job-material association
      const testJobMaterial = await prisma.jobMaterial.create({
        data: {
          jobId,
          materialId,
          amount: 5.0
        }
      });
      testJobMaterials.push(testJobMaterial);
    } else {
      testJobMaterials.push(existingJobMaterial);
    }
  } catch (error) {
    console.error(`Error setting up job-material association:`, error);
    throw error;
  }
});

Given('the database is reset for job-material tests', async function() {
  // Delete all job-material associations created for tests
  try {
    // Delete associations created during tests
    await prisma.jobMaterial.deleteMany({
      where: {
        OR: [
          { job: { title: { contains: 'Test Job' } } },
          { material: { name: { contains: 'Test Material' } } }
        ]
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}); 