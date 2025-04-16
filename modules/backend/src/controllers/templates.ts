import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all templates with optional filtering by type
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const where = type ? { type: String(type) } : {};
    
    const [templates, totalCount] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.template.count({ where }),
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      data: templates,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// Get a template by ID
export const getTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({
      where: { id: Number(id) },
    });
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

// Get default template for a specific type
export const getDefaultTemplate = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const template = await prisma.template.findFirst({
      where: { 
        type: String(type),
        isDefault: true 
      },
    });
    
    if (!template) {
      return res.status(404).json({ error: 'Default template not found for this type' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching default template:', error);
    res.status(500).json({ error: 'Failed to fetch default template' });
  }
};

// Create a new template
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { type, title, description, body, isDefault } = req.body;
    
    // If this is set as default, unset any existing default for this type
    if (isDefault) {
      await prisma.template.updateMany({
        where: { 
          type,
          isDefault: true 
        },
        data: { 
          isDefault: false 
        },
      });
    }
    
    const newTemplate = await prisma.template.create({
      data: {
        type,
        title,
        description,
        body,
        isDefault: Boolean(isDefault),
      },
    });
    
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

// Update a template
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, title, description, body, isDefault } = req.body;
    
    // If this is set as default, unset any existing default for this type
    if (isDefault) {
      await prisma.template.updateMany({
        where: { 
          type,
          isDefault: true,
          id: { not: Number(id) }
        },
        data: { 
          isDefault: false 
        },
      });
    }
    
    const updatedTemplate = await prisma.template.update({
      where: { id: Number(id) },
      data: {
        type,
        title,
        description,
        body,
        isDefault: Boolean(isDefault),
      },
    });
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

// Delete a template
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.template.delete({
      where: { id: Number(id) },
    });
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
}; 