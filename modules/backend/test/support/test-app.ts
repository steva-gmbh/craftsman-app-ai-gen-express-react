import express, { Router, Request, Response, RequestHandler } from 'express';
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
customerRouter.get('/', getCustomers as RequestHandler);
customerRouter.get('/:id', getCustomer as RequestHandler);
customerRouter.post('/', createCustomer as RequestHandler);
customerRouter.put('/:id', updateCustomer as RequestHandler);
customerRouter.delete('/:id', deleteCustomer as RequestHandler);

app.use('/api/customers', customerRouter);

// Setup vehicle routes
const vehicleRouter = Router();
vehicleRouter.get('/', getVehicles as RequestHandler);
vehicleRouter.get('/:id', getVehicle as RequestHandler);
vehicleRouter.post('/', createVehicle as RequestHandler);
vehicleRouter.put('/:id', updateVehicle as RequestHandler);
vehicleRouter.delete('/:id', deleteVehicle as RequestHandler);

app.use('/api/vehicles', vehicleRouter);

// Setup tool routes
const toolRouter = Router();
toolRouter.get('/', getTools as RequestHandler);
toolRouter.get('/:id', getTool as RequestHandler);
toolRouter.post('/', createTool as RequestHandler);
toolRouter.put('/:id', updateTool as RequestHandler);
toolRouter.delete('/:id', deleteTool as RequestHandler);

app.use('/api/tools', toolRouter);

// Setup material routes
const materialRouter = Router();
materialRouter.get('/', getMaterials as RequestHandler);
materialRouter.get('/:id', getMaterial as RequestHandler);
materialRouter.post('/', createMaterial as RequestHandler);
materialRouter.put('/:id', updateMaterial as RequestHandler);
materialRouter.delete('/:id', deleteMaterial as RequestHandler);

app.use('/api/materials', materialRouter);

// Setup job routes
const jobRouter = Router();
jobRouter.get('/', getJobs as RequestHandler);
jobRouter.get('/:id', getJob as RequestHandler);
jobRouter.post('/', createJob as RequestHandler);
jobRouter.put('/:id', updateJob as RequestHandler);
jobRouter.delete('/:id', deleteJob as RequestHandler);

// Job material routes
jobRouter.get('/:id/materials', getJobMaterials as RequestHandler);
jobRouter.post('/:id/materials', addJobMaterial as RequestHandler);

// Job tool routes
jobRouter.get('/:id/tools', getJobTools as RequestHandler);
jobRouter.post('/:id/tools', addJobTool as RequestHandler);

app.use('/api/jobs', jobRouter);

// Setup project routes
const projectRouter = Router();
projectRouter.get('/', getProjects as RequestHandler);
projectRouter.get('/:id', getProjectById as RequestHandler);
projectRouter.post('/', createProject as RequestHandler);
projectRouter.put('/:id', updateProject as RequestHandler);
projectRouter.delete('/:id', deleteProject as RequestHandler);

// Project-Job relationship routes
projectRouter.post('/:id/jobs', (async (req: Request, res: Response) => {
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
}) as RequestHandler);

projectRouter.delete('/:id/jobs/:jobId', (async (req: Request, res: Response) => {
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
}) as RequestHandler);

app.use('/api/projects', projectRouter);

// Setup settings routes
const settingsRouter = Router();
settingsRouter.get('/', getSettings as RequestHandler);
settingsRouter.get('/:userId', getSettingsByUserId as RequestHandler);
settingsRouter.post('/', createSettings as RequestHandler);
settingsRouter.put('/:userId', updateSettings as RequestHandler);
settingsRouter.delete('/:userId', deleteSettings as RequestHandler);

app.use('/api/settings', settingsRouter);

// Export prisma client for use in tests
export const prisma = new PrismaClient(prismaOptions);
