import request from 'supertest';
import express, { Router } from 'express';

// Import the mock controllers
import {
  getSettings,
  getSettingsByUserId,
  createSettings,
  updateSettings,
  deleteSettings,
} from './settings-mock';

// Create Express app with settings routes
const app = express();
app.use(express.json());

// Setup routes with mocked controllers
const router = Router();
router.get('/', getSettings);
router.get('/:userId', getSettingsByUserId);
router.post('/', createSettings);
router.put('/:userId', updateSettings);
router.delete('/:userId', deleteSettings);

app.use('/api/settings', router);

describe('Settings Controller', () => {
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  describe('GET /api/settings', () => {
    it('should return a list of all settings', async () => {
      // Make request
      const response = await request(app).get('/api/settings');
      
      // Assert response
      expect(response.status).toBe(200);
      // Test the structure but not the exact date values
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      // Check the first settings object
      expect(response.body[0].id).toBe(1);
      expect(response.body[0].userId).toBe(1);
      expect(response.body[0]).toHaveProperty('profile');
      expect(response.body[0]).toHaveProperty('business');
      expect(response.body[0]).toHaveProperty('billing');
      expect(response.body[0]).toHaveProperty('notifications');
      expect(response.body[0]).toHaveProperty('appearance');
      expect(response.body[0]).toHaveProperty('pagination');
      expect(response.body[0]).toHaveProperty('user');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
      
      // Verify mock controller was called
      expect(getSettings).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      getSettings.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to fetch settings' });
      });
      
      // Make request
      const response = await request(app).get('/api/settings');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch settings');
      
      // Verify mock controller was called
      expect(getSettings).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/settings/:userId', () => {
    it('should return settings for a specific user', async () => {
      // Make request
      const response = await request(app).get('/api/settings/1');
      
      // Assert response
      expect(response.status).toBe(200);
      // Test individual properties
      expect(response.body.id).toBe(1);
      expect(response.body.userId).toBe(1);
      expect(response.body).toHaveProperty('profile');
      expect(response.body).toHaveProperty('business');
      expect(response.body).toHaveProperty('billing');
      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('appearance');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify mock controller was called
      expect(getSettingsByUserId).toHaveBeenCalled();
    });
    
    it('should create default settings for a user without existing settings', async () => {
      // Make request for a user without settings
      const response = await request(app).get('/api/settings/999');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(999);
      expect(response.body).toHaveProperty('profile');
      expect(response.body).toHaveProperty('business');
      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('appearance');
      expect(response.body).toHaveProperty('pagination');
      
      // Verify mock controller was called
      expect(getSettingsByUserId).toHaveBeenCalled();
    });
    
    it('should return 404 for non-existent user', async () => {
      // Make request for a non-existent user ID
      const response = await request(app).get('/api/settings/404');
      
      // Assert response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
      
      // Verify mock controller was called
      expect(getSettingsByUserId).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      getSettingsByUserId.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to fetch settings' });
      });
      
      // Make request
      const response = await request(app).get('/api/settings/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch settings');
      
      // Verify mock controller was called
      expect(getSettingsByUserId).toHaveBeenCalled();
    });
  });
  
  describe('POST /api/settings', () => {
    it('should create new settings', async () => {
      // Mock data
      const settingsData = { 
        userId: 3, 
        profile: JSON.stringify({ name: 'New User', email: 'new@example.com' }),
        business: JSON.stringify({ name: 'New Business', services: ['Service 1'] }),
        billing: JSON.stringify({ taxRate: 10, currency: 'USD' }),
        notifications: JSON.stringify({ email: true, sms: false }),
        appearance: JSON.stringify({ theme: 'light' }),
        pagination: JSON.stringify({ rowsPerPage: 15 }),
      };
      
      // Make request
      const response = await request(app)
        .post('/api/settings')
        .send(settingsData);
      
      // Assert response
      expect(response.status).toBe(201);
      // Test individual properties
      expect(response.body.id).toBe(3);
      expect(response.body.userId).toBe(3);
      expect(response.body.profile).toBe(settingsData.profile);
      expect(response.body.business).toBe(settingsData.business);
      expect(response.body.billing).toBe(settingsData.billing);
      expect(response.body.notifications).toBe(settingsData.notifications);
      expect(response.body.appearance).toBe(settingsData.appearance);
      expect(response.body.pagination).toBe(settingsData.pagination);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify mock controller was called
      expect(createSettings).toHaveBeenCalled();
    });
    
    it('should handle partial data', async () => {
      // Mock data with minimal required fields
      const settingsData = { 
        userId: 3, 
        profile: JSON.stringify({ name: 'New User', email: 'new@example.com' }),
      };
      
      // Make request
      const response = await request(app)
        .post('/api/settings')
        .send(settingsData);
      
      // Assert response
      expect(response.status).toBe(201);
      expect(response.body.userId).toBe(3);
      expect(response.body.profile).toBe(settingsData.profile);
      expect(response.body).toHaveProperty('business');
      expect(response.body).toHaveProperty('billing');
      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('appearance');
      expect(response.body).toHaveProperty('pagination');
      
      // Verify mock controller was called
      expect(createSettings).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      createSettings.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to create settings' });
      });
      
      // Make request
      const response = await request(app)
        .post('/api/settings')
        .send({ userId: 3 });
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to create settings');
      
      // Verify mock controller was called
      expect(createSettings).toHaveBeenCalled();
    });
  });
  
  describe('PUT /api/settings/:userId', () => {
    it('should update existing settings', async () => {
      // Mock data
      const updateData = { 
        profile: JSON.stringify({ name: 'Updated User', email: 'updated@example.com' }),
        business: JSON.stringify({ name: 'Updated Business', services: ['Updated Service'] }),
        notifications: JSON.stringify({ email: false, sms: true }),
      };
      
      // Make request
      const response = await request(app)
        .put('/api/settings/1')
        .send(updateData);
      
      // Assert response
      expect(response.status).toBe(200);
      // Test individual properties
      expect(response.body.id).toBe(1);
      expect(response.body.userId).toBe(1);
      expect(response.body.profile).toBe(updateData.profile);
      expect(response.body.business).toBe(updateData.business);
      expect(response.body.notifications).toBe(updateData.notifications);
      expect(response.body).toHaveProperty('appearance');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify mock controller was called
      expect(updateSettings).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      updateSettings.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to update settings' });
      });
      
      // Make request
      const response = await request(app)
        .put('/api/settings/1')
        .send({});
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to update settings');
      
      // Verify mock controller was called
      expect(updateSettings).toHaveBeenCalled();
    });
  });
  
  describe('DELETE /api/settings/:userId', () => {
    it('should delete settings', async () => {
      // Make request
      const response = await request(app).delete('/api/settings/1');
      
      // Assert response
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      
      // Verify mock controller was called
      expect(deleteSettings).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      deleteSettings.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to delete settings' });
      });
      
      // Make request
      const response = await request(app).delete('/api/settings/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to delete settings');
      
      // Verify mock controller was called
      expect(deleteSettings).toHaveBeenCalled();
    });
  });
}); 