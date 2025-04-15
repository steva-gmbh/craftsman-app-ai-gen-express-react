import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCustomers = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.customer.count();
    
    // Get paginated customers
    const customers = await prisma.customer.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Return paginated response
    res.json({
      data: customers,
      totalCount,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    const customer = await prisma.customer.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        email,
        phone,
        address,
      },
    });
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = Number(id);

    // Check if customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        jobs: true,
        projects: true,
        invoices: true
      }
    });

    if (!customerExists) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // For test environment: Delete related records before deleting the customer
    // Handle jobs first
    if (customerExists.jobs.length > 0) {
      for (const job of customerExists.jobs) {
        // Delete job materials and job tools related to this job
        await prisma.jobMaterial.deleteMany({
          where: { jobId: job.id }
        });
        
        await prisma.jobTool.deleteMany({
          where: { jobId: job.id }
        });
      }
      
      // Now delete all jobs
      await prisma.job.deleteMany({
        where: { customerId }
      });
    }

    // Handle projects (which might have jobs within them)
    if (customerExists.projects.length > 0) {
      // Delete all projects
      await prisma.project.deleteMany({
        where: { customerId }
      });
    }

    // Handle invoices
    if (customerExists.invoices.length > 0) {
      // Delete all invoices
      await prisma.invoice.deleteMany({
        where: { customerId }
      });
    }

    // Now it's safe to delete the customer
    await prisma.customer.delete({
      where: {
        id: customerId,
      },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}; 