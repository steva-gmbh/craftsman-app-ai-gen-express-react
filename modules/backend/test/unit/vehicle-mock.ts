// Mock for the vehicle controller module
import { Request, Response } from 'express';

// Create mock functions with the same signature as the real controllers
export const getVehicles = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const mockVehicles = [
    { id: 1, name: 'Work Truck', make: 'Ford', model: 'F-150', year: 2022, type: 'truck', status: 'active', licensePlate: 'WRK-1234', color: 'Blue', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Delivery Van', make: 'Mercedes-Benz', model: 'Sprinter', year: 2021, type: 'van', status: 'active', licensePlate: 'DEL-5678', color: 'White', createdAt: new Date(), updatedAt: new Date() }
  ];
  
  // Get pagination parameters from query
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const totalCount = req.query.count ? parseInt(req.query.count as string) : 2;
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);
  
  res.json({
    data: mockVehicles,
    totalCount,
    totalPages,
    currentPage: page,
    limit
  });
});

export const getVehicle = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (id === '999') {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  
  const mockVehicle = { 
    id: Number(id), 
    name: 'Work Truck', 
    make: 'Ford', 
    model: 'F-150', 
    year: 2022, 
    type: 'truck', 
    status: 'active', 
    licensePlate: 'WRK-1234', 
    color: 'Blue', 
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.json(mockVehicle);
});

export const createVehicle = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const mockVehicle = { 
    id: 3, 
    ...req.body, 
    status: 'active',
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.status(201).json(mockVehicle);
});

export const updateVehicle = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const mockVehicle = { 
    id: Number(id), 
    ...req.body, 
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.json(mockVehicle);
});

export const deleteVehicle = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  res.status(204).send();
}); 