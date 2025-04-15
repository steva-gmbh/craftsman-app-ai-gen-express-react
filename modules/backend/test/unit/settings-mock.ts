// Mock for the settings controller module
import { Request, Response } from 'express';

// Create mock functions with the same signature as the real controllers
export const getSettings = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const mockSettings = [
    { 
      id: 1, 
      userId: 1, 
      profile: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
      business: JSON.stringify({ name: 'John\'s Business', services: ['Service 1', 'Service 2'] }),
      billing: JSON.stringify({ taxRate: 20, currency: 'USD' }),
      notifications: JSON.stringify({ email: true, sms: false }),
      appearance: JSON.stringify({ theme: 'light' }),
      pagination: JSON.stringify({ rowsPerPage: 10 }),
      user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      id: 2, 
      userId: 2, 
      profile: JSON.stringify({ name: 'Jane Smith', email: 'jane@example.com' }),
      business: JSON.stringify({ name: 'Jane\'s Business', services: ['Service 3', 'Service 4'] }),
      billing: JSON.stringify({ taxRate: 15, currency: 'EUR' }),
      notifications: JSON.stringify({ email: true, sms: true }),
      appearance: JSON.stringify({ theme: 'dark' }),
      pagination: JSON.stringify({ rowsPerPage: 20 }),
      user: { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  res.json(mockSettings);
});

export const getSettingsByUserId = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (userId === '999') {
    // Simulate scenario for a user without settings but user exists
    // In a real implementation, this would trigger default settings creation
    return res.json({
      id: 3,
      userId: 999,
      profile: JSON.stringify({ name: 'New User', email: 'newuser@example.com' }),
      business: JSON.stringify({ name: '', services: [] }),
      notifications: JSON.stringify({ email: true, sms: false }),
      appearance: JSON.stringify({ theme: 'light' }),
      pagination: JSON.stringify({ rowsPerPage: 10 }),
      user: { id: 999, name: 'New User', email: 'newuser@example.com', role: 'user' },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  if (userId === '404') {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const mockSettings = { 
    id: 1, 
    userId: Number(userId), 
    profile: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
    business: JSON.stringify({ name: 'John\'s Business', services: ['Service 1', 'Service 2'] }),
    billing: JSON.stringify({ taxRate: 20, currency: 'USD' }),
    notifications: JSON.stringify({ email: true, sms: false }),
    appearance: JSON.stringify({ theme: 'light' }),
    pagination: JSON.stringify({ rowsPerPage: 10 }),
    user: { id: Number(userId), name: 'John Doe', email: 'john@example.com', role: 'admin' },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json(mockSettings);
});

export const createSettings = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const mockSettings = { 
    id: 3, 
    ...req.body,
    profile: req.body.profile || JSON.stringify({}),
    business: req.body.business || JSON.stringify({}),
    billing: req.body.billing || JSON.stringify({}),
    notifications: req.body.notifications || JSON.stringify({}),
    appearance: req.body.appearance || JSON.stringify({}),
    pagination: req.body.pagination || JSON.stringify({}),
    user: { id: req.body.userId, name: 'Test User', email: 'test@example.com', role: 'user' },
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.status(201).json(mockSettings);
});

export const updateSettings = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const mockSettings = { 
    id: 1, 
    userId: Number(userId),
    ...req.body,
    profile: req.body.profile || JSON.stringify({}),
    business: req.body.business || JSON.stringify({}),
    billing: req.body.billing || JSON.stringify({}),
    notifications: req.body.notifications || JSON.stringify({}),
    appearance: req.body.appearance || JSON.stringify({}),
    pagination: req.body.pagination || JSON.stringify({}),
    user: { id: Number(userId), name: 'John Doe', email: 'john@example.com', role: 'admin' },
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.json(mockSettings);
});

export const deleteSettings = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  res.status(204).send();
}); 