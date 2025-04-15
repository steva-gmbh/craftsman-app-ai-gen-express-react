import request from 'supertest';
import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const originalModule = jest.requireActual('@prisma/client');
  const mockPrismaClient = {
    customer: {
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
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../../src/controllers/customers';

// Create Express app with customer routes
const app = express();
app.use(express.json());

// Setup routes
const router = Router();
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

app.use('/api/customers', router);

// Get mocked prisma client
const prisma = new PrismaClient() as any;

describe('Customer Controller', () => {
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  describe('GET /api/customers', () => {
    it('should return a list of customers with pagination', async () => {
      // Mock data
      const mockCustomers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', address: '123 Main St', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210', address: '456 Oak Ave', createdAt: new Date(), updatedAt: new Date() }
      ];
      
      // Setup mocks
      prisma.customer.count.mockResolvedValue(2);
      prisma.customer.findMany.mockResolvedValue(mockCustomers);
      
      // Make request
      const response = await request(app).get('/api/customers');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      // Test the structure but not the exact date values
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].id).toBe(1);
      expect(response.body.data[0].name).toBe('John Doe');
      expect(response.body.data[0].email).toBe('john@example.com');
      expect(response.body.data[0]).toHaveProperty('createdAt');
      expect(response.body.data[0]).toHaveProperty('updatedAt');
      
      expect(response.body).toHaveProperty('totalCount', 2);
      expect(response.body).toHaveProperty('totalPages', 1);
      expect(response.body).toHaveProperty('currentPage', 1);
      
      // Verify prisma was called correctly
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { id: 'asc' }
      });
    });
    
    it('should handle pagination parameters', async () => {
      // Setup mocks
      prisma.customer.count.mockResolvedValue(25);
      prisma.customer.findMany.mockResolvedValue([]);
      
      // Make request with pagination
      const response = await request(app).get('/api/customers?page=2&limit=5');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCount', 25);
      expect(response.body).toHaveProperty('totalPages', 5);
      expect(response.body).toHaveProperty('currentPage', 2);
      expect(response.body).toHaveProperty('limit', 5);
      
      // Verify prisma was called correctly
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { id: 'asc' }
      });
    });
    
    it('should handle database errors', async () => {
      // Setup mocks to throw error
      prisma.customer.count.mockRejectedValue(new Error('Database error'));
      
      // Make request
      const response = await request(app).get('/api/customers');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch customers');
    });
  });
  
  describe('GET /api/customers/:id', () => {
    it('should return a customer by id', async () => {
      // Mock data
      const mockCustomer = { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', address: '123 Main St', createdAt: new Date(), updatedAt: new Date() };
      
      // Setup mocks
      prisma.customer.findUnique.mockResolvedValue(mockCustomer);
      
      // Make request
      const response = await request(app).get('/api/customers/1');
      
      // Assert response
      expect(response.status).toBe(200);
      // Test individual properties instead of the whole object
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body.phone).toBe('123-456-7890');
      expect(response.body.address).toBe('123 Main St');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify prisma was called correctly
      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
    
    it('should return 404 for non-existent customer', async () => {
      // Setup mocks
      prisma.customer.findUnique.mockResolvedValue(null);
      
      // Make request
      const response = await request(app).get('/api/customers/999');
      
      // Assert response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Customer not found');
    });
    
    it('should handle database errors', async () => {
      // Setup mocks to throw error
      prisma.customer.findUnique.mockRejectedValue(new Error('Database error'));
      
      // Make request
      const response = await request(app).get('/api/customers/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch customer');
    });
  });
  
  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      // Mock data
      const customerData = { name: 'New Customer', email: 'new@example.com', phone: '555-123-4567', address: '789 New St' };
      const mockCustomer = { id: 3, ...customerData, createdAt: new Date(), updatedAt: new Date() };
      
      // Setup mocks
      prisma.customer.create.mockResolvedValue(mockCustomer);
      
      // Make request
      const response = await request(app)
        .post('/api/customers')
        .send(customerData);
      
      // Assert response
      expect(response.status).toBe(201);
      // Test individual properties
      expect(response.body.id).toBe(3);
      expect(response.body.name).toBe('New Customer');
      expect(response.body.email).toBe('new@example.com');
      expect(response.body.phone).toBe('555-123-4567');
      expect(response.body.address).toBe('789 New St');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify prisma was called correctly
      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: customerData
      });
    });
    
    it('should handle database errors', async () => {
      // Setup mocks to throw error
      prisma.customer.create.mockRejectedValue(new Error('Database error'));
      
      // Make request
      const response = await request(app)
        .post('/api/customers')
        .send({ name: 'Error Customer', email: 'error@example.com' });
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to create customer');
    });
  });
  
  describe('PUT /api/customers/:id', () => {
    it('should update an existing customer', async () => {
      // Mock data
      const customerData = { name: 'Updated Customer', email: 'updated@example.com', phone: '555-987-6543', address: '456 Update Rd' };
      const mockCustomer = { id: 1, ...customerData, createdAt: new Date(), updatedAt: new Date() };
      
      // Setup mocks
      prisma.customer.update.mockResolvedValue(mockCustomer);
      
      // Make request
      const response = await request(app)
        .put('/api/customers/1')
        .send(customerData);
      
      // Assert response
      expect(response.status).toBe(200);
      // Test individual properties
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Updated Customer');
      expect(response.body.email).toBe('updated@example.com');
      expect(response.body.phone).toBe('555-987-6543');
      expect(response.body.address).toBe('456 Update Rd');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify prisma was called correctly
      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: customerData
      });
    });
    
    it('should handle database errors', async () => {
      // Setup mocks to throw error
      prisma.customer.update.mockRejectedValue(new Error('Database error'));
      
      // Make request
      const response = await request(app)
        .put('/api/customers/1')
        .send({ name: 'Error Update', email: 'error@example.com' });
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to update customer');
    });
  });
  
  describe('DELETE /api/customers/:id', () => {
    it('should delete a customer', async () => {
      // Mock data for customer with no relationships
      const mockCustomer = {
        id: 1,
        name: 'Test Customer',
        email: 'test@example.com',
        jobs: [],
        projects: [],
        invoices: []
      };
      
      // Setup mocks
      prisma.customer.findUnique.mockResolvedValue(mockCustomer);
      prisma.customer.delete.mockResolvedValue({});
      
      // Make request
      const response = await request(app).delete('/api/customers/1');
      
      // Assert response
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      
      // Verify prisma was called correctly
      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          jobs: true,
          projects: true,
          invoices: true
        }
      });
      
      expect(prisma.customer.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
    
    it('should handle database errors', async () => {
      // Setup mocks to throw error
      prisma.customer.findUnique.mockRejectedValue(new Error('Database error'));
      
      // Make request
      const response = await request(app).delete('/api/customers/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to delete customer');
    });
  });
}); 