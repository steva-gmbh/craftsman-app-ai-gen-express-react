import express from 'express';
import cors from 'cors';
import jobsRoutes from './routes/jobs';
import materialsRoutes from './routes/materials';
import customersRoutes from './routes/customers';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import settingsRoutes from './routes/settings';
import toolsRoutes from './routes/tools';
import jobToolsRoutes from './routes/jobTools';
import aiRoutes from './routes/aiRoutes';
import projectsRoutes from './routes/projects';
import invoicesRoutes from './routes/invoices';
import vehiclesRoutes from './routes/vehicles';

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/job-tools', jobToolsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/vehicles', vehiclesRoutes);

export default app; 