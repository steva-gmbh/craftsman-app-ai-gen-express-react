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

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/jobs', jobToolsRoutes);

export default app; 