import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getJobTools = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const tools = await prisma.jobTool.findMany({
      where: {
        jobId: Number(jobId),
      },
      include: {
        tool: true,
      },
    });
    res.json(tools);
  } catch (error) {
    console.error('Error fetching job tools:', error);
    res.status(500).json({ error: 'Failed to fetch job tools' });
  }
};

export const addJobTool = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { toolId, amount } = req.body;

    // Check if the tool is already added to the job
    const existingTool = await prisma.jobTool.findUnique({
      where: {
        jobId_toolId: {
          jobId: Number(jobId),
          toolId: Number(toolId),
        },
      },
    });

    if (existingTool) {
      return res.status(400).json({ error: 'Tool already added to this job' });
    }

    const jobTool = await prisma.jobTool.create({
      data: {
        jobId: Number(jobId),
        toolId: Number(toolId),
        amount: Number(amount),
      },
      include: {
        tool: true,
      },
    });

    res.json(jobTool);
  } catch (error) {
    console.error('Error adding tool to job:', error);
    res.status(500).json({ error: 'Failed to add tool to job' });
  }
};

export const updateJobTool = async (req: Request, res: Response) => {
  try {
    const { jobId, toolId } = req.params;
    const { amount } = req.body;

    const jobTool = await prisma.jobTool.update({
      where: {
        jobId_toolId: {
          jobId: Number(jobId),
          toolId: Number(toolId),
        },
      },
      data: {
        amount: Number(amount),
      },
      include: {
        tool: true,
      },
    });

    res.json(jobTool);
  } catch (error) {
    console.error('Error updating job tool:', error);
    res.status(500).json({ error: 'Failed to update job tool' });
  }
};

export const removeJobTool = async (req: Request, res: Response) => {
  try {
    const { jobId, toolId } = req.params;

    await prisma.jobTool.delete({
      where: {
        jobId_toolId: {
          jobId: Number(jobId),
          toolId: Number(toolId),
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error removing tool from job:', error);
    res.status(500).json({ error: 'Failed to remove tool from job' });
  }
}; 