const API_BASE_URL = 'http://localhost:3001/api';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  customerId: number;
  projectId?: number;
  price?: number;
  startDate?: Date;
  endDate?: Date;
  customer?: Customer;
  project?: Project;
  materials?: JobMaterial[];
  tools?: JobTool[];
}

export interface JobMaterial {
  id: number;
  jobId: number;
  materialId: number;
  amount: number;
  material: Material;
}

export interface Material {
  id: number;
  name: string;
  description: string;
  unit: string;
  costPerUnit: number;
  color?: string;
  brand?: string;
  supplier?: string;
  category: string;
  stock: number;
  minStock: number;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  id: number;
  name: string;
  description: string;
  category: string;
  brand?: string;
  model?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobTool {
  id: number;
  jobId: number;
  toolId: number;
  amount: number;
  tool: Tool;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  customerId: number;
  customer?: Customer;
  jobs?: Job[];
  invoiceId?: number;
  invoice?: Invoice;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: string; // draft, sent, paid, overdue, cancelled
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  notes?: string;
  customerId: number;
  customer?: Customer;
  projects?: Project[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface Vehicle {
  id: number;
  name: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  vin?: string;
  color?: string;
  type: string;
  status: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  mileage?: number;
  fuelType?: string;
  notes?: string;
  customerId?: number;
  customer?: Customer;
  createdAt: Date;
  updatedAt: Date;
}

export const api = {
  // Customer endpoints
  getCustomers: async (params?: PaginationParams): Promise<PaginatedResponse<Customer>> => {
    const queryParams = params 
      ? `?page=${params.page}&limit=${params.limit}` 
      : '';
    const response = await fetch(`${API_BASE_URL}/customers${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    return response.json();
  },

  getCustomer: async (id: number): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer');
    }
    return response.json();
  },

  createCustomer: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    if (!response.ok) {
      throw new Error('Failed to create customer');
    }
    return response.json();
  },

  updateCustomer: async (id: number, customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    if (!response.ok) {
      throw new Error('Failed to update customer');
    }
    return response.json();
  },

  deleteCustomer: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }
  },

  // Job endpoints
  getJobs: async (params?: PaginationParams): Promise<PaginatedResponse<Job>> => {
    const queryParams = params 
      ? `?page=${params.page}&limit=${params.limit}` 
      : '';
    const response = await fetch(`${API_BASE_URL}/jobs${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return response.json();
  },

  getJob: async (id: number): Promise<Job> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }
    return response.json();
  },

  createJob: async (job: Omit<Job, 'id'>): Promise<Job> => {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
    });
    if (!response.ok) {
      throw new Error('Failed to create job');
    }
    return response.json();
  },

  updateJob: async (id: number, job: Omit<Job, 'id'>): Promise<Job> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
    });
    if (!response.ok) {
      throw new Error('Failed to update job');
    }
    return response.json();
  },

  deleteJob: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete job');
    }
  },

  // Material endpoints
  getMaterials: async (params?: PaginationParams): Promise<PaginatedResponse<Material>> => {
    const queryParams = params 
      ? `?page=${params.page}&limit=${params.limit}` 
      : '';
    const response = await fetch(`${API_BASE_URL}/materials${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }
    return response.json();
  },

  getMaterial: async (id: number): Promise<Material> => {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch material');
    }
    return response.json();
  },

  createMaterial: async (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<Material> => {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(material),
    });
    if (!response.ok) {
      throw new Error('Failed to create material');
    }
    return response.json();
  },

  updateMaterial: async (id: number, material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<Material> => {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(material),
    });
    if (!response.ok) {
      throw new Error('Failed to update material');
    }
    return response.json();
  },

  deleteMaterial: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete material');
    }
  },

  // Job Material endpoints
  getJobMaterials: async (jobId: number): Promise<JobMaterial[]> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/materials`);
    if (!response.ok) {
      throw new Error('Failed to fetch job materials');
    }
    return response.json();
  },

  addJobMaterial: async (jobId: number, materialId: number, amount: number): Promise<JobMaterial> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ materialId, amount }),
    });
    if (!response.ok) {
      throw new Error('Failed to add material to job');
    }
    return response.json();
  },

  updateJobMaterial: async (jobId: number, materialId: number, amount: number): Promise<JobMaterial> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/materials/${materialId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
      throw new Error('Failed to update job material');
    }
    return response.json();
  },

  removeJobMaterial: async (jobId: number, materialId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/materials/${materialId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove material from job');
    }
  },

  // Tool endpoints
  getTools: async (params?: PaginationParams): Promise<PaginatedResponse<Tool>> => {
    const queryParams = params 
      ? `?page=${params.page}&limit=${params.limit}` 
      : '';
    const response = await fetch(`${API_BASE_URL}/tools${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tools');
    }
    return response.json();
  },

  getTool: async (id: number): Promise<Tool> => {
    const response = await fetch(`${API_BASE_URL}/tools/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tool');
    }
    return response.json();
  },

  createTool: async (tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tool> => {
    const response = await fetch(`${API_BASE_URL}/tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tool),
    });
    if (!response.ok) {
      throw new Error('Failed to create tool');
    }
    return response.json();
  },

  updateTool: async (id: number, tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tool> => {
    const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tool),
    });
    if (!response.ok) {
      throw new Error('Failed to update tool');
    }
    return response.json();
  },

  deleteTool: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete tool');
    }
  },

  // Job Tool endpoints
  getJobTools: async (jobId: number): Promise<JobTool[]> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/tools`);
    if (!response.ok) {
      throw new Error('Failed to fetch job tools');
    }
    return response.json();
  },

  addJobTool: async (jobId: number, toolId: number, amount: number): Promise<JobTool> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ toolId, amount }),
    });
    if (!response.ok) {
      throw new Error('Failed to add tool to job');
    }
    return response.json();
  },

  updateJobTool: async (jobId: number, toolId: number, amount: number): Promise<JobTool> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/tools/${toolId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
      throw new Error('Failed to update job tool');
    }
    return response.json();
  },

  removeJobTool: async (jobId: number, toolId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/tools/${toolId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove tool from job');
    }
  },

  // User endpoints
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  getUser: async (id: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  createUser: async (user: { name: string; email: string; password: string; role: string }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  },

  updateUser: async (id: number, user: { name: string; email: string; role: string; password?: string }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return response.json();
  },

  deleteUser: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  },

  // Project endpoints
  getProjects: async (params?: PaginationParams): Promise<PaginatedResponse<Project>> => {
    const queryParams = params 
      ? `?page=${params.page}&limit=${params.limit}` 
      : '';
    const response = await fetch(`${API_BASE_URL}/projects${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  },

  getProject: async (id: number): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }
    return response.json();
  },

  createProject: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    return response.json();
  },

  updateProject: async (id: number, project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    return response.json();
  },

  deleteProject: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  },

  // User Settings endpoints
  getUserSettings: async (userId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/settings/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user settings');
    }
    return response.json();
  },

  updateUserSettings: async (userId: number, settings: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/settings/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error('Failed to update user settings');
    }
    return response.json();
  },

  // Invoice endpoints
  getInvoices: async (params?: PaginationParams): Promise<PaginatedResponse<Invoice>> => {
    const queryParams = params 
      ? `?page=${params.page}&limit=${params.limit}` 
      : '';
    const response = await fetch(`${API_BASE_URL}/invoices${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    return response.json();
  },

  getInvoice: async (id: number): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }
    return response.json();
  },

  createInvoice: async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });
    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }
    return response.json();
  },

  updateInvoice: async (id: number, invoice: Partial<Omit<Invoice, 'id'>>): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });
    if (!response.ok) {
      throw new Error('Failed to update invoice');
    }
    return response.json();
  },

  deleteInvoice: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }
  },

  // Vehicle endpoints
  getVehicles: async (params: { page?: number; limit?: number } = {}) => {
    const { page, limit } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const response = await fetch(`${API_BASE_URL}/vehicles${queryString ? `?${queryString}` : ''}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vehicles');
    }
    
    return response.json();
  },

  getVehicle: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle');
    }
    
    return response.json();
  },

  createVehicle: async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create vehicle');
    }
    
    return response.json();
  },

  updateVehicle: async (id: number, data: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update vehicle');
    }
    
    return response.json();
  },

  deleteVehicle: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete vehicle');
    }
    
    return response.status === 204 ? null : response.json();
  },
}; 