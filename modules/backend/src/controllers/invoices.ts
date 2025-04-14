import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all invoices
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [invoices, totalCount] = await Promise.all([
      prisma.invoice.findMany({
        skip,
        take: limit,
        include: {
          customer: true,
          projects: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.invoice.count(),
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      data: invoices,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Get a single invoice by ID
export const getInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        projects: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

// Create a new invoice
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { 
      invoiceNumber, 
      issueDate, 
      dueDate, 
      status, 
      totalAmount, 
      taxRate, 
      taxAmount, 
      notes, 
      customerId, 
      projectIds 
    } = req.body;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: new Date(dueDate),
        status: status || 'draft',
        totalAmount,
        taxRate: taxRate || 0,
        taxAmount,
        notes,
        customer: {
          connect: { id: customerId },
        },
      },
      include: {
        customer: true,
      },
    });

    // Connect projects to the invoice if provided
    if (projectIds && projectIds.length > 0) {
      for (const projectId of projectIds) {
        await prisma.project.update({
          where: { id: projectId },
          data: {
            invoice: {
              connect: { id: newInvoice.id },
            },
          },
        });
      }

      // Fetch the updated invoice with projects
      const updatedInvoice = await prisma.invoice.findUnique({
        where: { id: newInvoice.id },
        include: {
          customer: true,
          projects: true,
        },
      });

      return res.status(201).json(updatedInvoice);
    }

    res.status(201).json(newInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// Update an invoice
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      invoiceNumber, 
      issueDate, 
      dueDate, 
      status, 
      totalAmount, 
      taxRate, 
      taxAmount, 
      notes, 
      customerId, 
      projectIds 
    } = req.body;

    // Update invoice basic data
    const updatedInvoice = await prisma.invoice.update({
      where: { id: Number(id) },
      data: {
        invoiceNumber,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        totalAmount,
        taxRate,
        taxAmount,
        notes,
        ...(customerId && {
          customer: {
            connect: { id: customerId },
          },
        }),
      },
      include: {
        customer: true,
      },
    });

    // Handle projects if provided
    if (projectIds) {
      // First disconnect all current projects
      const currentProjects = await prisma.project.findMany({
        where: { invoiceId: Number(id) },
      });

      for (const project of currentProjects) {
        await prisma.project.update({
          where: { id: project.id },
          data: {
            invoiceId: null,
          },
        });
      }

      // Then connect new projects
      for (const projectId of projectIds) {
        await prisma.project.update({
          where: { id: projectId },
          data: {
            invoice: {
              connect: { id: Number(id) },
            },
          },
        });
      }

      // Get the updated invoice with all connections
      const finalInvoice = await prisma.invoice.findUnique({
        where: { id: Number(id) },
        include: {
          customer: true,
          projects: true,
        },
      });

      return res.json(finalInvoice);
    }

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

// Delete an invoice
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First disconnect all projects from this invoice
    const projects = await prisma.project.findMany({
      where: { invoiceId: Number(id) },
    });

    for (const project of projects) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          invoiceId: null,
        },
      });
    }

    // Then delete the invoice
    await prisma.invoice.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
}; 