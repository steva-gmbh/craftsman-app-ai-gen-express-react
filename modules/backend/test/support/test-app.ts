import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Import controllers
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../../src/controllers/customers';

import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../../src/controllers/vehicles';

import {
  getTools,
  getTool,
  createTool,
  updateTool,
  deleteTool
} from '../../src/controllers/tools';

import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from '../../src/controllers/materials';

import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobMaterials,
  addJobMaterial,
  getJobTools,
  addJobTool
} from '../../src/controllers/jobs';

import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../../src/controllers/projects';

import {
  getSettings,
  getSettingsByUserId,
  createSettings,
  updateSettings,
  deleteSettings
} from '../../src/controllers/settings';

// Initialize PrismaClient with connection to test database
const prismaOptions = {
  datasources: {
    db: {
      url: "file:./test.db"
    }
  },
  // Log queries only when debugging is needed
  log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error']
};

// Create Express app with customer routes
export const app = express();
app.use(express.json());

// Setup health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Setup customer routes
const customerRouter = Router();
customerRouter.get('/', getCustomers);
customerRouter.get('/:id', getCustomer);
customerRouter.post('/', createCustomer);
customerRouter.put('/:id', updateCustomer);
customerRouter.delete('/:id', deleteCustomer);

app.use('/api/customers', customerRouter);

// Setup vehicle routes
const vehicleRouter = Router();
vehicleRouter.get('/', getVehicles);
vehicleRouter.get('/:id', getVehicle);
vehicleRouter.post('/', createVehicle);
vehicleRouter.put('/:id', updateVehicle);
vehicleRouter.delete('/:id', deleteVehicle);

app.use('/api/vehicles', vehicleRouter);

// Setup tool routes
const toolRouter = Router();
toolRouter.get('/', getTools);
toolRouter.get('/:id', getTool);
toolRouter.post('/', createTool);
toolRouter.put('/:id', updateTool);
toolRouter.delete('/:id', deleteTool);

app.use('/api/tools', toolRouter);

// Setup material routes
const materialRouter = Router();
materialRouter.get('/', getMaterials);
materialRouter.get('/:id', getMaterial);
materialRouter.post('/', createMaterial);
materialRouter.put('/:id', updateMaterial);
materialRouter.delete('/:id', deleteMaterial);

app.use('/api/materials', materialRouter);

// Setup job routes
const jobRouter = Router();
jobRouter.get('/', getJobs);
jobRouter.get('/:id', getJob);
jobRouter.post('/', createJob);
jobRouter.put('/:id', updateJob);
jobRouter.delete('/:id', deleteJob);

// Job material routes
jobRouter.get('/:id/materials', getJobMaterials);
jobRouter.post('/:id/materials', addJobMaterial);

// Job tool routes
jobRouter.get('/:id/tools', getJobTools);
jobRouter.post('/:id/tools', addJobTool);

app.use('/api/jobs', jobRouter);

// Setup project routes
const projectRouter = Router();
projectRouter.get('/', getProjects);
projectRouter.get('/:id', getProjectById);
projectRouter.post('/', createProject);
projectRouter.put('/:id', updateProject);
projectRouter.delete('/:id', deleteProject);

// Project-Job relationship routes
projectRouter.post('/:id/jobs', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { jobId } = req.body;
  
  try {
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: { jobs: true }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: Number(jobId) }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Update the job to belong to this project
    await prisma.job.update({
      where: { id: Number(jobId) },
      data: { projectId: Number(id) }
    });
    
    // Return the updated project with jobs
    const updatedProject = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        jobs: true
      }
    });
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error adding job to project:', error);
    res.status(500).json({ error: 'Failed to add job to project' });
  }
});

projectRouter.delete('/:id/jobs/:jobId', async (req: Request, res: Response) => {
  const { id, jobId } = req.params;
  
  try {
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: Number(id) }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if job exists and belongs to the project
    const job = await prisma.job.findFirst({
      where: { 
        id: Number(jobId),
        projectId: Number(id)
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Update job to remove project reference
    await prisma.job.update({
      where: { id: Number(jobId) },
      data: { projectId: null }
    });
    
    // Return the updated project with jobs
    const updatedProject = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        jobs: true
      }
    });
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error removing job from project:', error);
    res.status(500).json({ error: 'Failed to remove job from project' });
  }
});

app.use('/api/projects', projectRouter);

// Setup settings routes
const settingsRouter = Router();
settingsRouter.get('/', getSettings);
settingsRouter.get('/:userId', getSettingsByUserId);
settingsRouter.post('/', createSettings);
settingsRouter.put('/:userId', updateSettings);
settingsRouter.delete('/:userId', deleteSettings);

app.use('/api/settings', settingsRouter);

// Export prisma client for use in tests
export const prisma = new PrismaClient(prismaOptions); 