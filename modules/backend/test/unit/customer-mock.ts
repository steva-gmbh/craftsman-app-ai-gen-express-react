// Mock for the customer controller module
import { Request, Response } from 'express';

// Create mock functions with the same signature as the real controllers
export const getCustomers = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const mockCustomers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', address: '123 Main St', billingAddress: '123 Main St', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210', address: '456 Oak Ave', billingAddress: '456 Oak Ave', createdAt: new Date(), updatedAt: new Date() }
  ];
  
  // Get pagination parameters from query
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const totalCount = req.query.count ? parseInt(req.query.count as string) : 2;
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);
  
  res.json({
    data: mockCustomers,
    totalCount,
    totalPages,
    currentPage: page,
    limit
  });
});

export const getCustomer = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (id === '999') {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  const mockCustomer = { 
    id: Number(id), 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '123-456-7890', 
    address: '123 Main St', 
    billingAddress: '123 Billing St',
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.json(mockCustomer);
});

export const createCustomer = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const mockCustomer = { 
    id: 3, 
    ...req.body, 
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.status(201).json(mockCustomer);
});

export const updateCustomer = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const mockCustomer = { 
    id: Number(id), 
    ...req.body, 
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.json(mockCustomer);
});

export const deleteCustomer = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  res.status(204).send();
}); 