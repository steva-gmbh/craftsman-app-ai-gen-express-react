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
  price?: number;
  startDate?: Date;
  endDate?: Date;
  customer?: Customer;
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
}; 