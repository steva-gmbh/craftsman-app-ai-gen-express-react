import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';

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

// Generate a PDF invoice
export const generateInvoicePdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Fetch invoice with customer and projects (including jobs)
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        projects: {
          include: {
            jobs: true
          }
        }
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add company info
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Add invoice info
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.text(`Status: ${invoice.status.toUpperCase()}`);
    doc.moveDown();

    // Add customer info
    doc.fontSize(14).text('Customer Information', { underline: true });
    doc.fontSize(12).text(`Name: ${invoice.customer.name}`);
    doc.text(`Email: ${invoice.customer.email}`);
    if (invoice.customer.phone) doc.text(`Phone: ${invoice.customer.phone}`);
    if (invoice.customer.address) doc.text(`Address: ${invoice.customer.address}`);
    doc.moveDown();

    // Projects and Jobs Table
    doc.fontSize(14).text('Projects and Jobs', { underline: true });
    doc.moveDown();

    let totalJobsCost = 0;

    // Draw table headers
    const tableTop = doc.y;
    const tableHeaders = ['Project', 'Job', 'Description', 'Status', 'Price'];
    const columnWidths = [100, 100, 150, 80, 70];
    let currentY = tableTop;
    
    // Draw headers
    doc.fontSize(10);
    doc.font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      const x = 50 + columnWidths.slice(0, i).reduce((sum, width) => sum + width, 0);
      doc.text(header, x, currentY);
    });
    
    doc.font('Helvetica');
    currentY += 20;
    doc.moveTo(50, currentY).lineTo(500, currentY).stroke();
    currentY += 10;

    // Draw rows
    if (invoice.projects && invoice.projects.length > 0) {
      for (const project of invoice.projects) {
        const projectName = project.name;
        
        if (project.jobs && project.jobs.length > 0) {
          for (const job of project.jobs) {
            // Check if we need a new page
            if (currentY > 700) {
              doc.addPage();
              currentY = 50;
            }
            
            const price = job.price || 0;
            totalJobsCost += price;
            
            // Job row
            let x = 50;
            doc.text(projectName, x, currentY);
            x += columnWidths[0];
            doc.text(job.title, x, currentY);
            x += columnWidths[1];
            doc.text(job.description, x, currentY, { width: columnWidths[2] - 10 });
            x += columnWidths[2];
            doc.text(job.status, x, currentY);
            x += columnWidths[3];
            doc.text(`$${price.toFixed(2)}`, x, currentY);
            
            // Move down for next row, accounting for multi-line descriptions
            const textHeight = doc.heightOfString(job.description, { width: columnWidths[2] - 10 });
            currentY += Math.max(textHeight, 20) + 10;
          }
        } else {
          // Project with no jobs
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }
          
          let x = 50;
          doc.text(projectName, x, currentY);
          x += columnWidths[0];
          doc.text('No jobs', x, currentY);
          currentY += 20;
        }
      }
    } else {
      doc.text('No projects or jobs found for this invoice', 50, currentY);
      currentY += 20;
    }

    // Draw a line after the table
    doc.moveTo(50, currentY).lineTo(500, currentY).stroke();
    currentY += 20;

    // Summary section
    doc.fontSize(12).text(`Subtotal: $${totalJobsCost.toFixed(2)}`, 350, currentY);
    currentY += 20;
    doc.text(`Tax (${invoice.taxRate}%): $${invoice.taxAmount.toFixed(2)}`, 350, currentY);
    currentY += 20;
    doc.fontSize(14).font('Helvetica-Bold').text(`Total Amount: $${invoice.totalAmount.toFixed(2)}`, 350, currentY);
    
    // Add notes if present
    if (invoice.notes) {
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('Notes', { underline: true });
      doc.fontSize(12).font('Helvetica').text(invoice.notes);
    }

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ error: 'Failed to generate invoice PDF' });
  }
}; 