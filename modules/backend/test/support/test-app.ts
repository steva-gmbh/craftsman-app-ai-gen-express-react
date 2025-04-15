import express, { Router } from 'express';
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

// Export prisma client for use in tests
export const prisma = new PrismaClient(); 