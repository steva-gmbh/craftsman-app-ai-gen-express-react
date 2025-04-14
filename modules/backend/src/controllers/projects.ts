import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.project.count();
    
    // Get paginated projects
    const projects = await prisma.project.findMany({
      skip,
      take: limit,
      include: {
        customer: true,
        jobs: true,
      },
      orderBy: { id: 'asc' }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Return paginated response
    res.json({
      data: projects,
      totalCount,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        jobs: true,
      },
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const { name, description, status, budget, startDate, endDate, customerId } = req.body;
  
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        customer: {
          connect: { id: Number(customerId) },
        },
      },
      include: {
        customer: true,
      },
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, status, budget, startDate, endDate, customerId } = req.body;
  
  try {
    const project = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        status,
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        customer: {
          connect: { id: Number(customerId) },
        },
      },
      include: {
        customer: true,
      },
    });
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // First, make sure to update all associated jobs to remove the project reference
    await prisma.job.updateMany({
      where: { projectId: Number(id) },
      data: { projectId: null },
    });
    
    // Then delete the project
    await prisma.project.delete({
      where: { id: Number(id) },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}; 