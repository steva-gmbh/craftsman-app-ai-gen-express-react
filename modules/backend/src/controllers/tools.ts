import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTools = async (req: Request, res: Response) => {
  try {
    const tools = await prisma.tool.findMany();
    res.json(tools);
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
    await prisma.tool.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tool:', error);
    res.status(500).json({ error: 'Failed to delete tool' });
  }
}; 