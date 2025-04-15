import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Export the prisma instance so it can be mocked in tests
export const prisma = new PrismaClient();

export const getVehicles = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.vehicle.count();
    
    // Get paginated vehicles
    const vehicles = await prisma.vehicle.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Return paginated response
    res.json({
      data: vehicles,
      totalCount,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

export const getVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(id) }
    });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicle = await prisma.vehicle.create({
      data: req.body,
    });
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
}; 