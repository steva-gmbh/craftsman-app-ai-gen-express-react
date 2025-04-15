import request from 'supertest';
import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const originalModule = jest.requireActual('@prisma/client');
  const mockPrismaClient = {
    vehicle: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  };
  return {
    __esModule: true,
    ...originalModule,
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Import controllers
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../../src/controllers/vehicles';

// Create Express app with vehicle routes
const app = express();
app.use(express.json());

// Setup routes
const router = Router();
router.get('/', getVehicles);
router.get('/:id', getVehicle);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

app.use('/api/vehicles', router);

// Get mocked prisma client
const prisma = new PrismaClient() as any;

describe('Vehicle Controller', () => {
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  describe('GET /api/vehicles', () => {
    it('should return a list of vehicles with pagination', async () => {
      // Mock data
      const mockVehicles = [
        { id: 1, name: 'Work Truck', make: 'Ford', model: 'F-150', year: 2022, type: 'truck', status: 'active', licensePlate: 'WRK-1234', color: 'Blue', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Delivery Van', make: 'Mercedes-Benz', model: 'Sprinter', year: 2021, type: 'van', status: 'active', licensePlate: 'DEL-5678', color: 'White', createdAt: new Date(), updatedAt: new Date() }
      ];
      
      // Setup mocks
      prisma.vehicle.count.mockResolvedValue(2);
      prisma.vehicle.findMany.mockResolvedValue(mockVehicles);
      
      // Make request
      const response = await request(app).get('/api/vehicles');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].id).toBe(1);
      expect(response.body.data[0].name).toBe('Work Truck');
      expect(response.body.data[0].make).toBe('Ford');
      expect(response.body.data[0]).toHaveProperty('createdAt');
      expect(response.body.data[0]).toHaveProperty('updatedAt');
      
      expect(response.body).toHaveProperty('totalCount', 2);
      expect(response.body).toHaveProperty('totalPages', 1);
      expect(response.body).toHaveProperty('currentPage', 1);
      
      // Verify prisma was called correctly
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { id: 'asc' }
      });
    });
    
    it('should handle pagination parameters', async () => {
      // Setup mocks
      prisma.vehicle.count.mockResolvedValue(25);
      prisma.vehicle.findMany.mockResolvedValue([]);
      
      // Make request with pagination
      const response = await request(app).get('/api/vehicles?page=2&limit=5');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCount', 25);
      expect(response.body).toHaveProperty('totalPages', 5);
      expect(response.body).toHaveProperty('currentPage', 2);
      expect(response.body).toHaveProperty('limit', 5);
      
      // Verify prisma was called correctly
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { id: 'asc' }
      });
    });
    
    it('should handle database errors', async () => {
      // Setup mocks to throw error
      prisma.vehicle.count.mockRejectedValue(new Error('Database error'));
      
      // Make request
      const response = await request(app).get('/api/vehicles');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch vehicles');
    });
  });
  
  describe('GET /api/vehicles/:id', () => {
    it('should return a vehicle by id', async () => {
      // Mock data
      const mockVehicle = { id: 1, name: 'Work Truck', make: 'Ford', model: 'F-150', year: 2022, type: 'truck', status: 'active', licensePlate: 'WRK-1234', color: 'Blue', createdAt: new Date(), updatedAt: new Date() };
      
      // Setup mocks
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      
      // Make request
      const response = await request(app).get('/api/vehicles/1');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Work Truck');
      expect(response.body.make).toBe('Ford');
      expect(response.body.model).toBe('F-150');
      expect(response.body.year).toBe(2022);
      expect(response.body.type).toBe('truck');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify prisma was called correctly
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
    
    it('should return 404 for non-existent vehicle', async () => {
      // Setup mocks
      prisma.vehicle.findUnique.mockResolvedValue(null);
      
      // Make request
      const response = await request(app).get('/api/vehicles/999');
      
      // Assert response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Vehicle not found');
    });
    
    it('should handle database errors', async () => {
      // Setup mocks to throw error
      prisma.vehicle.findUnique.mockRejectedValue(new Error('Database error'));
      
      // Make request
      const response = await request(app).get('/api/vehicles/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch vehicle');
    });
  });
  
  describe('POST /api/vehicles', () => {
    it('should create a new vehicle', async () => {
      // Mock data
      const vehicleData = { 
        name: 'Test Vehicle', 
        make: 'Toyota', 
        model: 'Corolla', 
        year: 2023, 
        type: 'sedan', 
        licensePlate: 'TEST-123', 
        color: 'Silver'
      };
      const mockVehicle = { 
        id: 3, 
        ...vehicleData, 
        status: 'active',
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // Setup mocks
      prisma.vehicle.create.mockResolvedValue(mockVehicle);
      
      // Make request
      const response = await request(app)
        .post('/api/vehicles')
        .send(vehicleData);
      
      // Assert response
      expect(response.status).toBe(201);
      expect(response.body.id).toBe(3);
      expect(response.body.name).toBe('Test Vehicle');
      expect(response.body.make).toBe('Toyota');
      expect(response.body.model).toBe('Corolla');
      expect(response.body.year).toBe(2023);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify prisma was called correctly
      expect(prisma.vehicle.create).toHaveBeenCalledWith({
        data: vehicleData
      });
    });
    
    it('should handle database errors', async () => {
      // Setup mocks to throw error
      prisma.vehicle.create.mockRejectedValue(new Error('Database error'));
      
      // Make request
      const response = await request(app)
        .post('/api/vehicles')
        .send({ name: 'Error Vehicle', make: 'Error', model: 'Error', year: 2020, type: 'sedan' });
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to create vehicle');
    });
  });
  
  describe('PUT /api/vehicles/:id', () => {
    it('should update an existing vehicle', async () => {
      // Mock data
      const vehicleData = { 
        name: 'Updated Vehicle', 
        make: 'Honda', 
        model: 'Civic', 
        year: 2022, 
        type: 'sedan', 
        licensePlate: 'UPD-456', 
        color: 'Blue',
        mileage: 15000
      };
      const mockVehicle = { 
        id: 1, 
        ...vehicleData, 
        status: 'active',
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // Setup mocks
      prisma.vehicle.update.mockResolvedValue(mockVehicle);
      
      // Make request
      const response = await request(app)
        .put('/api/vehicles/1')
        .send(vehicleData);
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Updated Vehicle');
      expect(response.body.make).toBe('Honda');
      expect(response.body.model).toBe('Civic');
      expect(response.body.mileage).toBe(15000);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify prisma was called correctly
      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: vehicleData
      });
    });
    
    it('should handle database errors', async () => {
      // Setup mocks to throw error
      prisma.vehicle.update.mockRejectedValue(new Error('Database error'));
      
      // Make request
      const response = await request(app)
        .put('/api/vehicles/1')
        .send({ name: 'Error Update', make: 'Error', model: 'Error', year: 2020 });
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to update vehicle');
    });
  });
  
  describe('DELETE /api/vehicles/:id', () => {
    it('should delete a vehicle', async () => {
      // Mock data for vehicle with no relationships
      const mockVehicle = {
        id: 1,
        name: 'Test Vehicle',
        make: 'Toyota',
        model: 'Corolla',
        year: 2023,
        type: 'sedan'
      };
      
      // Setup mocks
      prisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
      prisma.vehicle.delete.mockResolvedValue({});
      
      // Make request
      const response = await request(app).delete('/api/vehicles/1');
      
      // Assert response
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      
      // Verify prisma was called correctly
      expect(prisma.vehicle.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
    
    it('should handle database errors', async () => {
      // Setup mocks to throw error
      prisma.vehicle.delete.mockRejectedValue(new Error('Database error'));
      
      // Make request
      const response = await request(app).delete('/api/vehicles/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to delete vehicle');
    });
  });
}); 