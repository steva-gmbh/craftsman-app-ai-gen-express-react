import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getJobs = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.job.count();
    
    // Get paginated jobs
    const jobs = await prisma.job.findMany({
      skip,
      take: limit,
      include: {
        customer: true,
        project: true,
        materials: true,
        tools: true,
      },
      orderBy: { id: 'asc' }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Return paginated response
    res.json({
      data: jobs,
      totalCount,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        customer: true,
        project: true,
        materials: {
          include: {
            material: true,
          },
        },
        tools: {
          include: {
            tool: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, description, status, customerId, projectId, price, startDate, endDate } = req.body;
    const job = await prisma.job.create({
      data: {
        title,
        description,
        status,
        customerId: Number(customerId),
        projectId: projectId ? Number(projectId) : undefined,
        price: price ? Number(price) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        customer: true,
        project: true,
        materials: {
          include: {
            material: true,
          },
        },
        tools: {
          include: {
            tool: true,
          },
        },
      },
    });
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, customerId, projectId, price, startDate, endDate } = req.body;
    const job = await prisma.job.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
        status,
        customerId: Number(customerId),
        projectId: projectId ? Number(projectId) : null,
        price: price ? Number(price) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        customer: true,
        project: true,
        materials: {
          include: {
            material: true,
          },
        },
        tools: {
          include: {
            tool: true,
          },
        },
      },
    });
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.job.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
}; 