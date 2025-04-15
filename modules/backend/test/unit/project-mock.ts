// Mock for the project controller module
import { Request, Response } from 'express';

// Create mock functions with the same signature as the real controllers
export const getProjects = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const mockProjects = [
    { 
      id: 1, 
      name: 'Home Renovation', 
      description: 'Complete home renovation project', 
      status: 'active', 
      budget: 10000.00, 
      startDate: new Date('2023-01-01'), 
      endDate: new Date('2023-06-30'), 
      customerId: 1,
      customer: { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com' 
      },
      jobs: [
        {
          id: 1,
          title: 'Kitchen Remodel',
          description: 'Remodel the kitchen',
          status: 'completed',
          price: 3000.00,
          startDate: new Date('2023-01-15'),
          endDate: new Date('2023-02-20'),
          customerId: 1
        },
        {
          id: 2,
          title: 'Bathroom Renovation',
          description: 'Renovate the bathroom',
          status: 'in-progress',
          price: 2500.00,
          startDate: new Date('2023-03-01'),
          endDate: null,
          customerId: 1
        }
      ],
      createdAt: new Date(), 
      updatedAt: new Date() 
    },
    { 
      id: 2, 
      name: 'Office Remodel', 
      description: 'Office space remodeling', 
      status: 'pending', 
      budget: 5000.00, 
      startDate: new Date('2023-03-15'), 
      endDate: null, 
      customerId: 2,
      customer: { 
        id: 2, 
        name: 'Jane Smith', 
        email: 'jane@example.com' 
      },
      jobs: [],
      createdAt: new Date(), 
      updatedAt: new Date() 
    }
  ];
  
  // Get pagination parameters from query
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const totalCount = req.query.count ? parseInt(req.query.count as string) : 2;
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);
  
  res.json({
    data: mockProjects,
    totalCount,
    totalPages,
    currentPage: page,
    limit
  });
});

export const getProjectById = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (id === '999') {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // For testing projects with jobs
  if (id === '1') {
    const mockProject = { 
      id: 1, 
      name: 'Home Renovation', 
      description: 'Complete home renovation project', 
      status: 'active', 
      budget: 10000.00, 
      startDate: new Date('2023-01-01'), 
      endDate: new Date('2023-06-30'), 
      customerId: 1,
      customer: { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com' 
      },
      jobs: [
        {
          id: 1,
          title: 'Kitchen Remodel',
          description: 'Remodel the kitchen',
          status: 'completed',
          price: 3000.00,
          startDate: new Date('2023-01-15'),
          endDate: new Date('2023-02-20'),
          customerId: 1
        },
        {
          id: 2,
          title: 'Bathroom Renovation',
          description: 'Renovate the bathroom',
          status: 'in-progress',
          price: 2500.00,
          startDate: new Date('2023-03-01'),
          endDate: null,
          customerId: 1
        }
      ],
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    
    return res.json(mockProject);
  }
  
  const mockProject = { 
    id: Number(id), 
    name: 'Office Remodel', 
    description: 'Office space remodeling', 
    status: 'pending', 
    budget: 5000.00, 
    startDate: new Date('2023-03-15'), 
    endDate: null, 
    customerId: 2,
    customer: { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com' 
    },
    jobs: [],
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.json(mockProject);
});

export const createProject = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const mockProject = { 
    id: 3, 
    ...req.body, 
    startDate: req.body.startDate ? new Date(req.body.startDate) : null,
    endDate: req.body.endDate ? new Date(req.body.endDate) : null,
    customer: {
      id: Number(req.body.customerId),
      name: 'Test Customer',
      email: 'test@example.com'
    },
    jobs: [],
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.status(201).json(mockProject);
});

export const updateProject = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const mockProject = { 
    id: Number(id), 
    ...req.body, 
    startDate: req.body.startDate ? new Date(req.body.startDate) : null,
    endDate: req.body.endDate ? new Date(req.body.endDate) : null,
    customer: {
      id: Number(req.body.customerId),
      name: 'Test Customer',
      email: 'test@example.com'
    },
    jobs: [],
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.json(mockProject);
});

export const deleteProject = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  res.status(204).send();
});

// Mock function for testing adding a job to a project
export const addJobToProject = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { jobId } = req.body;
  
  if (id === '999') {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  if (jobId === 999) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  const mockProject = { 
    id: Number(id), 
    name: 'Home Renovation', 
    description: 'Complete home renovation project', 
    status: 'active', 
    budget: 10000.00, 
    startDate: new Date('2023-01-01'), 
    endDate: new Date('2023-06-30'), 
    customerId: 1,
    customer: { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com' 
    },
    jobs: [
      {
        id: 1,
        title: 'Kitchen Remodel',
        description: 'Remodel the kitchen',
        status: 'completed',
        price: 3000.00,
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-02-20'),
        customerId: 1
      },
      {
        id: 2,
        title: 'Bathroom Renovation',
        description: 'Renovate the bathroom',
        status: 'in-progress',
        price: 2500.00,
        startDate: new Date('2023-03-01'),
        endDate: null,
        customerId: 1
      },
      {
        id: Number(jobId),
        title: 'New Job',
        description: 'A new job added to the project',
        status: 'pending',
        price: 1500.00,
        startDate: null,
        endDate: null,
        customerId: 1
      }
    ],
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.json(mockProject);
});

// Mock function for testing removing a job from a project
export const removeJobFromProject = jest.fn().mockImplementation(async (req: Request, res: Response) => {
  const { id, jobId } = req.params;
  
  if (id === '999') {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  if (jobId === '999') {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  const mockProject = { 
    id: Number(id), 
    name: 'Home Renovation', 
    description: 'Complete home renovation project', 
    status: 'active', 
    budget: 10000.00, 
    startDate: new Date('2023-01-01'), 
    endDate: new Date('2023-06-30'), 
    customerId: 1,
    customer: { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com' 
    },
    jobs: [
      {
        id: 1,
        title: 'Kitchen Remodel',
        description: 'Remodel the kitchen',
        status: 'completed',
        price: 3000.00,
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-02-20'),
        customerId: 1
      }
    ],
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
  
  res.json(mockProject);
}); 