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
  createdAt?: Date;
  updatedAt?: Date;
}

export const api = {
  // Customer endpoints
  getCustomers: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/customers`);
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
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
  getJobs: async (): Promise<Job[]> => {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
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
  getMaterials: async (): Promise<Material[]> => {
    const response = await fetch(`${API_BASE_URL}/materials`);
    if (!response.ok) {
      throw new Error('Failed to fetch materials');
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
  getTools: async (): Promise<Tool[]> => {
    const response = await fetch(`${API_BASE_URL}/tools`);
    if (!response.ok) {
      throw new Error('Failed to fetch tools');
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
  getProjects: async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
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
}; 