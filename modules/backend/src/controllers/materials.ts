import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMaterials = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.material.count();
    
    // Get paginated materials
    const materials = await prisma.material.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Return paginated response
    res.json({
      data: materials,
      totalCount,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

export const getMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const material = await prisma.material.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      unit,
      costPerUnit,
      color,
      brand,
      supplier,
      category,
      stock,
      minStock,
      location,
      notes,
    } = req.body;

    const material = await prisma.material.create({
      data: {
        name,
        description,
        unit,
        costPerUnit: Number(costPerUnit),
        color,
        brand,
        supplier,
        category,
        stock: Number(stock),
        minStock: Number(minStock),
        location,
        notes,
      },
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      unit,
      costPerUnit,
      color,
      brand,
      supplier,
      category,
      stock,
      minStock,
      location,
      notes,
    } = req.body;

    const material = await prisma.material.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        description,
        unit,
        costPerUnit: Number(costPerUnit),
        color,
        brand,
        supplier,
        category,
        stock: Number(stock),
        minStock: Number(minStock),
        location,
        notes,
      },
    });

    res.json(material);
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const materialId = Number(id);
    
    // First check if the material exists
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        jobs: true // Include associated job-material relationships
      }
    });
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Delete any job-material associations first
    if (material.jobs.length > 0) {
      await prisma.jobMaterial.deleteMany({
        where: { 
          materialId: materialId 
        }
      });
    }
    
    // Now delete the material
    await prisma.material.delete({
      where: { id: materialId },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
}; 