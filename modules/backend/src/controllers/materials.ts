import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const materials = await prisma.material.findMany();
    res.json(materials);
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
    await prisma.material.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
}; 