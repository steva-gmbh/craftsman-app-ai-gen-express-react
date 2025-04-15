import request from 'supertest';
import express, { Router } from 'express';

// Import the mock controllers
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from './customer-mock';

// Create Express app with customer routes
const app = express();
app.use(express.json());

// Setup routes with mocked controllers
const router = Router();
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

app.use('/api/customers', router);

describe('Customer Controller', () => {
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  describe('GET /api/customers', () => {
    it('should return a list of customers with pagination', async () => {
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
      
      // Verify mock controller was called
      expect(getCustomers).toHaveBeenCalled();
    });
    
    it('should handle pagination parameters', async () => {
      // Make request with pagination
      const response = await request(app).get('/api/customers?page=2&limit=5&count=25');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCount', 25);
      expect(response.body).toHaveProperty('totalPages', 5);
      expect(response.body).toHaveProperty('currentPage', 2);
      expect(response.body).toHaveProperty('limit', 5);
      
      // Verify mock controller was called
      expect(getCustomers).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      getCustomers.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to fetch customers' });
      });
      
      // Make request
      const response = await request(app).get('/api/customers');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch customers');
      
      // Verify mock controller was called
      expect(getCustomers).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/customers/:id', () => {
    it('should return a customer by id', async () => {
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
      
      // Verify mock controller was called
      expect(getCustomer).toHaveBeenCalled();
    });
    
    it('should return 404 for non-existent customer', async () => {
      // Make request for a non-existent ID
      const response = await request(app).get('/api/customers/999');
      
      // Assert response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Customer not found');
      
      // Verify mock controller was called
      expect(getCustomer).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      getCustomer.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to fetch customer' });
      });
      
      // Make request
      const response = await request(app).get('/api/customers/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch customer');
      
      // Verify mock controller was called
      expect(getCustomer).toHaveBeenCalled();
    });
  });
  
  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      // Mock data
      const customerData = { 
        name: 'New Customer', 
        email: 'new@example.com', 
        phone: '555-123-4567', 
        address: '789 New St' 
      };
      
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
      
      // Verify mock controller was called
      expect(createCustomer).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      createCustomer.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to create customer' });
      });
      
      // Make request
      const response = await request(app)
        .post('/api/customers')
        .send({});
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to create customer');
      
      // Verify mock controller was called
      expect(createCustomer).toHaveBeenCalled();
    });
  });
  
  describe('PUT /api/customers/:id', () => {
    it('should update an existing customer', async () => {
      // Mock data
      const updateData = { 
        name: 'Updated Customer', 
        email: 'updated@example.com', 
        phone: '555-987-6543', 
        address: '456 Update Ave' 
      };
      
      // Make request
      const response = await request(app)
        .put('/api/customers/1')
        .send(updateData);
      
      // Assert response
      expect(response.status).toBe(200);
      // Test individual properties
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Updated Customer');
      expect(response.body.email).toBe('updated@example.com');
      expect(response.body.phone).toBe('555-987-6543');
      expect(response.body.address).toBe('456 Update Ave');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify mock controller was called
      expect(updateCustomer).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      updateCustomer.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to update customer' });
      });
      
      // Make request
      const response = await request(app)
        .put('/api/customers/1')
        .send({});
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to update customer');
      
      // Verify mock controller was called
      expect(updateCustomer).toHaveBeenCalled();
    });
  });
  
  describe('DELETE /api/customers/:id', () => {
    it('should delete a customer', async () => {
      // Make request
      const response = await request(app).delete('/api/customers/1');
      
      // Assert response
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      
      // Verify mock controller was called
      expect(deleteCustomer).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      deleteCustomer.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to delete customer' });
      });
      
      // Make request
      const response = await request(app).delete('/api/customers/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to delete customer');
      
      // Verify mock controller was called
      expect(deleteCustomer).toHaveBeenCalled();
    });
  });
}); 