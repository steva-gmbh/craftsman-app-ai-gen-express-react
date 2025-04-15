import { Given } from '@cucumber/cucumber';
import { prisma } from '../support/test-app';

// Response storage
let testJobTools: any[] = [];

// Given steps
Given('there is a job-tool association with job ID {int} and tool ID {int}', async function(jobId: number, toolId: number) {
  try {
    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    
    // Check if tool exists
    const tool = await prisma.tool.findUnique({
      where: { id: toolId }
    });
    
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    if (!tool) {
      throw new Error(`Tool with ID ${toolId} not found`);
    }
    
    // Check if association already exists
    const existingJobTool = await prisma.jobTool.findFirst({
      where: {
        jobId,
        toolId
      }
    });
    
    if (!existingJobTool) {
      // Create test job-tool association
      const testJobTool = await prisma.jobTool.create({
        data: {
          jobId,
          toolId,
          amount: 1
        }
      });
      testJobTools.push(testJobTool);
    } else {
      testJobTools.push(existingJobTool);
    }
  } catch (error) {
    console.error(`Error setting up job-tool association:`, error);
    throw error;
  }
});

Given('the database is reset for job-tool tests', async function() {
  // Delete all job-tool associations created for tests
  try {
    // Delete associations created during tests
    await prisma.jobTool.deleteMany({
      where: {
        OR: [
          { job: { title: { contains: 'Test Job' } } },
          { tool: { name: { contains: 'Test Tool' } } }
        ]
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}); 