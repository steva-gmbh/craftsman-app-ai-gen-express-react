import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Customer routes
app.get('/api/customers', async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching customers' });
  }
});

app.post('/api/customers', async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.create({
      data: req.body,
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Error creating customer' });
  }
});

app.put('/api/customers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Error updating customer' });
  }
});

app.delete('/api/customers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // First delete all jobs associated with the customer
    await prisma.job.deleteMany({
      where: { customerId: Number(id) },
    });
    // Then delete the customer
    await prisma.customer.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting customer' });
  }
});

// Job routes
app.get('/api/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching jobs' });
  }
});

app.post('/api/jobs', async (req: Request, res: Response) => {
  try {
    const job = await prisma.job.create({
      data: req.body,
    });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Error creating job' });
  }
});

app.put('/api/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Error updating job' });
  }
});

app.delete('/api/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.job.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting job' });
  }
});

// Settings routes
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    console.log('Fetching settings for user 1');
    const settings = await prisma.settings.findFirst({
      where: { userId: 1 }, // TODO: Get from authenticated user
    });
    console.log('Settings found:', settings);
    res.json(settings || {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Error fetching settings', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.put('/api/settings', async (req: Request, res: Response) => {
  try {
    console.log('Received settings update request:', req.body);
    const { profile, business, billing, notifications, appearance } = req.body;
    
    // Log each field being processed
    console.log('Processing fields:', {
      profile: profile ? 'present' : 'missing',
      business: business ? 'present' : 'missing',
      billing: billing ? 'present' : 'missing',
      notifications: notifications ? 'present' : 'missing',
      appearance: appearance ? 'present' : 'missing'
    });

    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { id: 1 }
    });

    if (!user) {
      console.log('User not found, creating default user');
      // Create default user if not exists
      const newUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: 'password', // In a real app, this should be hashed
          name: 'Admin User',
          role: 'admin',
        },
      });
      console.log('Created default user:', newUser);
    }

    const settings = await prisma.settings.upsert({
      where: { userId: 1 },
      update: {
        profile: profile ? JSON.stringify(profile) : null,
        business: business ? JSON.stringify(business) : null,
        billing: billing ? JSON.stringify(billing) : null,
        notifications: notifications ? JSON.stringify(notifications) : null,
        appearance: appearance ? JSON.stringify(appearance) : null,
      },
      create: {
        userId: 1,
        profile: profile ? JSON.stringify(profile) : null,
        business: business ? JSON.stringify(business) : null,
        billing: billing ? JSON.stringify(billing) : null,
        notifications: notifications ? JSON.stringify(notifications) : null,
        appearance: appearance ? JSON.stringify(appearance) : null,
      },
    });
    
    console.log('Settings updated successfully:', settings);
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    res.status(500).json({ 
      error: 'Error updating settings', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 