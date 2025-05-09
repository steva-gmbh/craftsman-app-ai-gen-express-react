import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTools = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.tool.count();
    
    // Get paginated tools
    const tools = await prisma.tool.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Return paginated response
    res.json({
      data: tools,
      totalCount,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
};

export const getTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tool = await prisma.tool.findUnique({
      where: { id: Number(id) },
    });
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(tool);
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({ error: 'Failed to fetch tool' });
  }
};

export const createTool = async (req: Request, res: Response) => {
  try {
    const tool = await prisma.tool.create({
      data: req.body,
    });
    res.status(201).json(tool);
  } catch (error) {
    console.error('Error creating tool:', error);
    res.status(500).json({ error: 'Failed to create tool' });
  }
};

export const updateTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tool = await prisma.tool.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(tool);
  } catch (error) {
    console.error('Error updating tool:', error);
    res.status(500).json({ error: 'Failed to update tool' });
  }
};

export const deleteTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const toolId = Number(id);
    
    // First check if the tool exists
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        jobs: true // Include associated job-tool relationships
      }
    });
    
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    
    // Delete any job-tool associations first
    if (tool.jobs.length > 0) {
      await prisma.jobTool.deleteMany({
        where: { 
          toolId: toolId 
        }
      });
    }
    
    // Now delete the tool
    await prisma.tool.delete({
      where: { id: toolId },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tool:', error);
    res.status(500).json({ error: 'Failed to delete tool' });
  }
}; 