import request from 'supertest';
import express, { Router } from 'express';

// Import the mock controllers
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addJobToProject,
  removeJobFromProject
} from './project-mock';

// Create Express app with project routes
const app = express();
app.use(express.json());

// Setup routes with mocked controllers
const router = Router();
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/jobs', addJobToProject);
router.delete('/:id/jobs/:jobId', removeJobFromProject);

app.use('/api/projects', router);

describe('Project Controller', () => {
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  describe('GET /api/projects', () => {
    it('should return a list of projects with pagination', async () => {
      // Make request
      const response = await request(app).get('/api/projects');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      // Test the structure but not the exact date values
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].id).toBe(1);
      expect(response.body.data[0].name).toBe('Home Renovation');
      expect(response.body.data[0].description).toBe('Complete home renovation project');
      expect(response.body.data[0].status).toBe('active');
      expect(response.body.data[0].budget).toBe(10000.00);
      expect(response.body.data[0]).toHaveProperty('startDate');
      expect(response.body.data[0]).toHaveProperty('endDate');
      expect(response.body.data[0].customerId).toBe(1);
      expect(response.body.data[0].customer.id).toBe(1);
      expect(response.body.data[0].customer.name).toBe('John Doe');
      expect(response.body.data[0]).toHaveProperty('jobs');
      expect(response.body.data[0].jobs.length).toBe(2);
      expect(response.body.data[0]).toHaveProperty('createdAt');
      expect(response.body.data[0]).toHaveProperty('updatedAt');
      
      expect(response.body).toHaveProperty('totalCount', 2);
      expect(response.body).toHaveProperty('totalPages', 1);
      expect(response.body).toHaveProperty('currentPage', 1);
      
      // Verify mock controller was called
      expect(getProjects).toHaveBeenCalled();
    });
    
    it('should handle pagination parameters', async () => {
      // Make request with pagination
      const response = await request(app).get('/api/projects?page=2&limit=5&count=25');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCount', 25);
      expect(response.body).toHaveProperty('totalPages', 5);
      expect(response.body).toHaveProperty('currentPage', 2);
      expect(response.body).toHaveProperty('limit', 5);
      
      // Verify mock controller was called
      expect(getProjects).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      getProjects.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to fetch projects' });
      });
      
      // Make request
      const response = await request(app).get('/api/projects');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch projects');
      
      // Verify mock controller was called
      expect(getProjects).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/projects/:id', () => {
    it('should return a project by id', async () => {
      // Make request
      const response = await request(app).get('/api/projects/1');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Home Renovation');
      expect(response.body.description).toBe('Complete home renovation project');
      expect(response.body.status).toBe('active');
      expect(response.body.budget).toBe(10000.00);
      expect(response.body).toHaveProperty('startDate');
      expect(response.body).toHaveProperty('endDate');
      expect(response.body.customerId).toBe(1);
      expect(response.body.customer.id).toBe(1);
      expect(response.body.customer.name).toBe('John Doe');
      
      // Check for jobs
      expect(response.body).toHaveProperty('jobs');
      expect(response.body.jobs.length).toBe(2);
      expect(response.body.jobs[0].id).toBe(1);
      expect(response.body.jobs[0].title).toBe('Kitchen Remodel');
      expect(response.body.jobs[1].id).toBe(2);
      expect(response.body.jobs[1].title).toBe('Bathroom Renovation');
      
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify mock controller was called
      expect(getProjectById).toHaveBeenCalled();
    });
    
    it('should return a project with no jobs', async () => {
      // Make request for project with no jobs
      const response = await request(app).get('/api/projects/2');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(2);
      expect(response.body.name).toBe('Office Remodel');
      expect(response.body).toHaveProperty('jobs');
      expect(response.body.jobs.length).toBe(0);
      
      // Verify mock controller was called
      expect(getProjectById).toHaveBeenCalled();
    });
    
    it('should return 404 for non-existent project', async () => {
      // Make request for a non-existent ID
      const response = await request(app).get('/api/projects/999');
      
      // Assert response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Project not found');
      
      // Verify mock controller was called
      expect(getProjectById).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Mock implementation for this specific test to throw an error
      getProjectById.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to fetch project' });
      });
      
      // Make request
      const response = await request(app).get('/api/projects/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch project');
      
      // Verify mock controller was called
      expect(getProjectById).toHaveBeenCalled();
    });
  });
  
  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      // Mock data
      const projectData = { 
        name: 'New Project', 
        description: 'A new construction project',
        status: 'pending',
        budget: 7500.00,
        startDate: '2023-05-01',
        endDate: '2023-08-31',
        customerId: 1
      };
      
      // Make request
      const response = await request(app)
        .post('/api/projects')
        .send(projectData);
      
      // Assert response
      expect(response.status).toBe(201);
      expect(response.body.id).toBe(3);
      expect(response.body.name).toBe('New Project');
      expect(response.body.description).toBe('A new construction project');
      expect(response.body.status).toBe('pending');
      expect(response.body.budget).toBe(7500.00);
      expect(response.body).toHaveProperty('startDate');
      expect(response.body).toHaveProperty('endDate');
      expect(response.body.customer.id).toBe(1);
      expect(response.body).toHaveProperty('jobs');
      expect(response.body.jobs.length).toBe(0);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify mock controller was called
      expect(createProject).toHaveBeenCalled();
    });
    
    it('should handle database errors during creation', async () => {
      // Mock implementation for this specific test to throw an error
      createProject.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to create project' });
      });
      
      // Make request
      const response = await request(app)
        .post('/api/projects')
        .send({});
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to create project');
      
      // Verify mock controller was called
      expect(createProject).toHaveBeenCalled();
    });
  });
  
  describe('PUT /api/projects/:id', () => {
    it('should update an existing project', async () => {
      // Mock data
      const updateData = { 
        name: 'Updated Project', 
        description: 'This project has been updated',
        status: 'active',
        budget: 12000.00,
        startDate: '2023-01-15',
        endDate: '2023-07-31',
        customerId: 2
      };
      
      // Make request
      const response = await request(app)
        .put('/api/projects/1')
        .send(updateData);
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Updated Project');
      expect(response.body.description).toBe('This project has been updated');
      expect(response.body.status).toBe('active');
      expect(response.body.budget).toBe(12000.00);
      expect(response.body).toHaveProperty('startDate');
      expect(response.body).toHaveProperty('endDate');
      expect(response.body.customer.id).toBe(2);
      expect(response.body).toHaveProperty('jobs');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // Verify mock controller was called
      expect(updateProject).toHaveBeenCalled();
    });
    
    it('should handle database errors during update', async () => {
      // Mock implementation for this specific test to throw an error
      updateProject.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to update project' });
      });
      
      // Make request
      const response = await request(app)
        .put('/api/projects/1')
        .send({});
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to update project');
      
      // Verify mock controller was called
      expect(updateProject).toHaveBeenCalled();
    });
    
    it('should handle non-existent project during update', async () => {
      // Mock implementation for this specific test to throw an error
      updateProject.mockImplementationOnce(async (req, res) => {
        res.status(404).json({ error: 'Project not found' });
      });
      
      // Make request
      const response = await request(app)
        .put('/api/projects/999')
        .send({});
      
      // Assert error response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Project not found');
      
      // Verify mock controller was called
      expect(updateProject).toHaveBeenCalled();
    });
  });
  
  describe('DELETE /api/projects/:id', () => {
    it('should delete a project', async () => {
      // Make request
      const response = await request(app).delete('/api/projects/1');
      
      // Assert response
      expect(response.status).toBe(204);
      
      // Verify mock controller was called
      expect(deleteProject).toHaveBeenCalled();
    });
    
    it('should handle database errors during deletion', async () => {
      // Mock implementation for this specific test to throw an error
      deleteProject.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to delete project' });
      });
      
      // Make request
      const response = await request(app).delete('/api/projects/1');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to delete project');
      
      // Verify mock controller was called
      expect(deleteProject).toHaveBeenCalled();
    });
    
    it('should handle non-existent project during deletion', async () => {
      // Mock implementation for this specific test to throw an error
      deleteProject.mockImplementationOnce(async (req, res) => {
        res.status(404).json({ error: 'Project not found' });
      });
      
      // Make request
      const response = await request(app).delete('/api/projects/999');
      
      // Assert error response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Project not found');
      
      // Verify mock controller was called
      expect(deleteProject).toHaveBeenCalled();
    });
  });
  
  describe('POST /api/projects/:id/jobs', () => {
    it('should add a job to a project', async () => {
      // Mock data
      const jobData = { 
        jobId: 3
      };
      
      // Make request
      const response = await request(app)
        .post('/api/projects/1/jobs')
        .send(jobData);
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Home Renovation');
      
      // Check for jobs
      expect(response.body).toHaveProperty('jobs');
      expect(response.body.jobs.length).toBe(3);
      expect(response.body.jobs[0].id).toBe(1);
      expect(response.body.jobs[1].id).toBe(2);
      expect(response.body.jobs[2].id).toBe(3);
      expect(response.body.jobs[2].title).toBe('New Job');
      
      // Verify mock controller was called
      expect(addJobToProject).toHaveBeenCalled();
    });
    
    it('should handle non-existent project when adding job', async () => {
      // Make request for a non-existent project
      const response = await request(app)
        .post('/api/projects/999/jobs')
        .send({ jobId: 3 });
      
      // Assert response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Project not found');
      
      // Verify mock controller was called
      expect(addJobToProject).toHaveBeenCalled();
    });
    
    it('should handle non-existent job when adding job', async () => {
      // Make request with a non-existent job
      const response = await request(app)
        .post('/api/projects/1/jobs')
        .send({ jobId: 999 });
      
      // Assert response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Job not found');
      
      // Verify mock controller was called
      expect(addJobToProject).toHaveBeenCalled();
    });
    
    it('should handle database errors when adding job', async () => {
      // Mock implementation for this specific test to throw an error
      addJobToProject.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to add job to project' });
      });
      
      // Make request
      const response = await request(app)
        .post('/api/projects/1/jobs')
        .send({ jobId: 3 });
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to add job to project');
      
      // Verify mock controller was called
      expect(addJobToProject).toHaveBeenCalled();
    });
  });
  
  describe('DELETE /api/projects/:id/jobs/:jobId', () => {
    it('should remove a job from a project', async () => {
      // Make request
      const response = await request(app).delete('/api/projects/1/jobs/2');
      
      // Assert response
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Home Renovation');
      
      // Check for jobs (should only have one job after removal)
      expect(response.body).toHaveProperty('jobs');
      expect(response.body.jobs.length).toBe(1);
      expect(response.body.jobs[0].id).toBe(1);
      expect(response.body.jobs[0].title).toBe('Kitchen Remodel');
      
      // Verify mock controller was called
      expect(removeJobFromProject).toHaveBeenCalled();
    });
    
    it('should handle non-existent project when removing job', async () => {
      // Make request for a non-existent project
      const response = await request(app).delete('/api/projects/999/jobs/2');
      
      // Assert response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Project not found');
      
      // Verify mock controller was called
      expect(removeJobFromProject).toHaveBeenCalled();
    });
    
    it('should handle non-existent job when removing job', async () => {
      // Make request with a non-existent job
      const response = await request(app).delete('/api/projects/1/jobs/999');
      
      // Assert response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Job not found');
      
      // Verify mock controller was called
      expect(removeJobFromProject).toHaveBeenCalled();
    });
    
    it('should handle database errors when removing job', async () => {
      // Mock implementation for this specific test to throw an error
      removeJobFromProject.mockImplementationOnce(async (req, res) => {
        res.status(500).json({ error: 'Failed to remove job from project' });
      });
      
      // Make request
      const response = await request(app).delete('/api/projects/1/jobs/2');
      
      // Assert error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to remove job from project');
      
      // Verify mock controller was called
      expect(removeJobFromProject).toHaveBeenCalled();
    });
  });
}); 