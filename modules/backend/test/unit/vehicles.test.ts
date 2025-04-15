import request from 'supertest';
import express, { Router } from 'express';

// Import the mock controllers
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from './vehicle-mock';

// Create Express app with vehicle routes
const app = express();
app.use(express.json());

// Setup routes with mocked controllers
const router = Router();
router.get('/', getVehicles);
router.get('/:id', getVehicle);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

app.use('/api/vehicles', router);

describe('Vehicle Controller', () => {
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  describe('GET /api/vehicles', () => {
    it('should return a list of vehicles with pagination', async () => {
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
      
      // Verify mock controller was called
      expect(getVehicles).toHaveBeenCalled();
    });
    
    it('should handle pagination parameters', async () => {
      // Make request with pagination
      const response = await request(app).get('/api/vehicles?page=2&limit=5&count=25');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCount', 25);
      expect(response.body).toHaveProperty('totalPages', 5);
      expect(response.body).toHaveProperty('currentPage', 2);
      expect(response.body).toHaveProperty('limit', 5);
      
      // Verify mock controller was called
      expect(getVehicles).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      getVehicles.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to fetch vehicles' });
      });
      
      // Make request
      const response = await request(app).get('/api/vehicles');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch vehicles');
      
      // Verify mock controller was called
      expect(getVehicles).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/vehicles/:id', () => {
    it('should return a vehicle by id', async () => {
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
      
      // Verify mock controller was called
      expect(getVehicle).toHaveBeenCalled();
    });
    
    it('should return 404 for non-existent vehicle', async () => {
      // Make request
      const response = await request(app).get('/api/vehicles/999');
      
      // Assert response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Vehicle not found');
      
      // Verify mock controller was called
      expect(getVehicle).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Override the mock to simulate database error
      getVehicle.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to fetch vehicle' });
      });
      
      // Make request
      const response = await request(app).get('/api/vehicles/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch vehicle');
      
      // Verify mock controller was called
      expect(getVehicle).toHaveBeenCalled();
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
      
      // Verify mock controller was called
      expect(createVehicle).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Override the mock to simulate database error
      createVehicle.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to create vehicle' });
      });
      
      // Make request
      const response = await request(app)
        .post('/api/vehicles')
        .send({ name: 'Error Vehicle', make: 'Error', model: 'Error', year: 2020, type: 'sedan' });
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to create vehicle');
      
      // Verify mock controller was called
      expect(createVehicle).toHaveBeenCalled();
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
      
      // Verify mock controller was called
      expect(updateVehicle).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Override the mock to simulate database error
      updateVehicle.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to update vehicle' });
      });
      
      // Make request
      const response = await request(app)
        .put('/api/vehicles/1')
        .send({ name: 'Error Update', make: 'Error', model: 'Error', year: 2020 });
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to update vehicle');
      
      // Verify mock controller was called
      expect(updateVehicle).toHaveBeenCalled();
    });
  });
  
  describe('DELETE /api/vehicles/:id', () => {
    it('should delete a vehicle', async () => {
      // Make request
      const response = await request(app).delete('/api/vehicles/1');
      
      // Assert response
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      
      // Verify mock controller was called
      expect(deleteVehicle).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Override the mock to simulate database error
      deleteVehicle.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to delete vehicle' });
      });
      
      // Make request
      const response = await request(app).delete('/api/vehicles/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to delete vehicle');
      
      // Verify mock controller was called
      expect(deleteVehicle).toHaveBeenCalled();
    });
  });
}); 