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

    // Fetch default invoice template if it exists
    const templateData = await prisma.template.findFirst({
      where: {
        type: 'invoice',
        isDefault: true
      }
    });
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Calculate total jobs cost for use in variables
    let totalJobsCost = 0;
    const jobsData = [];

    // Prepare jobs data for template and calculate totals
    if (invoice.projects && invoice.projects.length > 0) {
      for (const project of invoice.projects) {
        if (project.jobs && project.jobs.length > 0) {
          for (const job of project.jobs) {
            const price = job.price || 0;
            totalJobsCost += price;
            
            jobsData.push({
              project: project.name,
              title: job.title,
              description: job.description,
              status: job.status,
              price: price
            });
          }
        }
      }
    }

    // Check if we have a template to use
    if (templateData) {
      // Process template and replace placeholders with actual data
      let content = templateData.body;
      
      // Replace invoice placeholders
      content = content.replace(/{{invoice\.invoiceNumber}}/g, invoice.invoiceNumber);
      content = content.replace(/{{invoice\.issueDate}}/g, new Date(invoice.issueDate).toLocaleDateString());
      content = content.replace(/{{invoice\.dueDate}}/g, new Date(invoice.dueDate).toLocaleDateString());
      content = content.replace(/{{invoice\.status}}/g, invoice.status.toUpperCase());
      content = content.replace(/{{invoice\.totalAmount}}/g, `$${invoice.totalAmount.toFixed(2)}`);
      content = content.replace(/{{invoice\.taxRate}}/g, `${invoice.taxRate}%`);
      content = content.replace(/{{invoice\.taxAmount}}/g, `$${invoice.taxAmount.toFixed(2)}`);
      content = content.replace(/{{invoice\.subtotal}}/g, `$${totalJobsCost.toFixed(2)}`);
      content = content.replace(/{{invoice\.notes}}/g, invoice.notes || '');
      
      // Replace customer placeholders
      content = content.replace(/{{customer\.name}}/g, invoice.customer.name);
      content = content.replace(/{{customer\.email}}/g, invoice.customer.email);
      content = content.replace(/{{customer\.phone}}/g, invoice.customer.phone || '');
      content = content.replace(/{{customer\.address}}/g, invoice.customer.address || '');
      content = content.replace(/{{customer\.billingAddress}}/g, invoice.customer.billingAddress || invoice.customer.address || '');
      
      // Process loops over projects and jobs
      content = processTemplateLoops(content, invoice);
      
      // Only render the template content, no extras
      renderHtmlToPdf(doc, content);
    }
    else {
      // No template found - show a blank page with info message
      
      doc.fontSize(18).text('Invoice PDF Generator', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).text('No invoice template has been defined.', { align: 'center' });
      doc.moveDown();
      doc.text('Please create a default invoice template in the Templates section.', { align: 'center' });
    }

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ error: 'Failed to generate invoice PDF' });
  }
};

// Process template loops for projects and jobs
function processTemplateLoops(content: string, invoice: any): string {
  // Process project loops first - Pattern: {{#each projects}} ... {{/each}}
  const projectLoopRegex = /{{#each\s+projects}}([\s\S]*?){{\/each}}/g;
  let projectLoopMatch;
  
  if (invoice.projects && invoice.projects.length > 0) {
    while ((projectLoopMatch = projectLoopRegex.exec(content)) !== null) {
      const fullMatch = projectLoopMatch[0];
      const loopContent = projectLoopMatch[1];
      
      let replacementContent = '';
      
      // Process each project
      for (const project of invoice.projects) {
        let projectContent = loopContent;
        
        // Replace project variables in this iteration
        projectContent = projectContent.replace(/{{project\.name}}/g, project.name);
        projectContent = projectContent.replace(/{{project\.description}}/g, project.description || '');
        projectContent = projectContent.replace(/{{project\.status}}/g, project.status || '');
        projectContent = projectContent.replace(/{{project\.budget}}/g, project.budget ? `$${project.budget.toFixed(2)}` : 'N/A');
        
        if (project.startDate) {
          projectContent = projectContent.replace(/{{project\.startDate}}/g, new Date(project.startDate).toLocaleDateString());
        } else {
          projectContent = projectContent.replace(/{{project\.startDate}}/g, 'N/A');
        }
        
        if (project.endDate) {
          projectContent = projectContent.replace(/{{project\.endDate}}/g, new Date(project.endDate).toLocaleDateString());
        } else {
          projectContent = projectContent.replace(/{{project\.endDate}}/g, 'N/A');
        }
        
        // Process job loops within this project
        const jobLoopRegex = /{{#each\s+jobs}}([\s\S]*?){{\/each}}/g;
        let jobLoopMatch;
        
        if (project.jobs && project.jobs.length > 0) {
          while ((jobLoopMatch = jobLoopRegex.exec(projectContent)) !== null) {
            const fullJobMatch = jobLoopMatch[0];
            const jobLoopContent = jobLoopMatch[1];
            
            let jobReplacementContent = '';
            
            // Process each job
            for (const job of project.jobs) {
              let jobContent = jobLoopContent;
              
              // Replace job variables in this iteration
              jobContent = jobContent.replace(/{{job\.title}}/g, job.title);
              jobContent = jobContent.replace(/{{job\.description}}/g, job.description || '');
              jobContent = jobContent.replace(/{{job\.status}}/g, job.status || '');
              jobContent = jobContent.replace(/{{job\.price}}/g, job.price ? `$${job.price.toFixed(2)}` : '$0.00');
              
              if (job.startDate) {
                jobContent = jobContent.replace(/{{job\.startDate}}/g, new Date(job.startDate).toLocaleDateString());
              } else {
                jobContent = jobContent.replace(/{{job\.startDate}}/g, 'N/A');
              }
              
              if (job.endDate) {
                jobContent = jobContent.replace(/{{job\.endDate}}/g, new Date(job.endDate).toLocaleDateString());
              } else {
                jobContent = jobContent.replace(/{{job\.endDate}}/g, 'N/A');
              }
              
              jobReplacementContent += jobContent;
            }
            
            // Replace the job loop with the processed content
            projectContent = projectContent.replace(fullJobMatch, jobReplacementContent);
          }
        } else {
          // No jobs, remove any job loops
          projectContent = projectContent.replace(jobLoopRegex, '');
        }
        
        replacementContent += projectContent;
      }
      
      // Replace the project loop with the processed content
      content = content.replace(fullMatch, replacementContent);
    }
  } else {
    // No projects, remove any project loops
    content = content.replace(projectLoopRegex, '');
  }
  
  return content;
}

// Helper function to render HTML-like content to PDF
function renderHtmlToPdf(doc: PDFKit.PDFDocument, html: string) {
  try {
    // Extract and process content for headers
    processHeaders(doc, html);
    
    // Extract and process content for bold text
    processBoldText(doc, html);
    
    // If no special formatting was found, just render the plain text
    if (doc.y === 50) { // Default Y position, meaning no text has been added yet
      doc.fontSize(12).font('Helvetica');
      doc.text(html.replace(/<[^>]*>/g, '').trim());
    }
  } catch (error) {
    console.error('Error processing HTML:', error);
    // Fall back to plain text
    doc.fontSize(12).font('Helvetica');
    doc.text(html.replace(/<[^>]*>/g, '').trim());
  }
}

// Process H1-H6 headers
function processHeaders(doc: PDFKit.PDFDocument, html: string) {
  // Handle H1
  const h1Regex = /<h1[^>]*>(.*?)<\/h1>/gis;
  let match;
  
  while ((match = h1Regex.exec(html)) !== null) {
    const headerText = match[1].replace(/<[^>]*>/g, '').trim();
    doc.fontSize(24).font('Helvetica-Bold');
    doc.text(headerText);
    doc.fontSize(12).font('Helvetica');
    doc.moveDown();
  }
  
  // Handle H2
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gis;
  while ((match = h2Regex.exec(html)) !== null) {
    const headerText = match[1].replace(/<[^>]*>/g, '').trim();
    doc.fontSize(20).font('Helvetica-Bold');
    doc.text(headerText);
    doc.fontSize(12).font('Helvetica');
    doc.moveDown();
  }
  
  // Handle H3
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gis;
  while ((match = h3Regex.exec(html)) !== null) {
    const headerText = match[1].replace(/<[^>]*>/g, '').trim();
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text(headerText);
    doc.fontSize(12).font('Helvetica');
    doc.moveDown();
  }
}

// Process bold text
function processBoldText(doc: PDFKit.PDFDocument, html: string) {
  // Process paragraphs with bold text
  const paragraphs = html.split('</p>');
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue;
    
    const pMatch = paragraph.match(/<p[^>]*>(.*)/is);
    if (!pMatch) continue;
    
    const pContent = pMatch[1].trim();
    let alignMode: string = 'left';
    
    // Check for alignment
    if (paragraph.includes('class="ql-align-center"')) {
      alignMode = 'center';
    } else if (paragraph.includes('class="ql-align-right"')) {
      alignMode = 'right';
    } else if (paragraph.includes('class="ql-align-justify"')) {
      alignMode = 'justify';
    }
    
    // Check for bold text within paragraph
    const boldMatches = pContent.match(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi);
    
    if (boldMatches && boldMatches.length > 0) {
      let processedContent = pContent;
      
      for (const boldTag of boldMatches) {
        const boldText = boldTag.replace(/<[^>]*>/g, '').trim();
        const parts = processedContent.split(boldTag);
        
        // Process the parts around bold text
        if (parts[0]) {
          doc.fontSize(12).font('Helvetica');
          doc.text(parts[0].replace(/<[^>]*>/g, '').trim(), { 
            continued: true,
            align: alignMode as any
          });
        }
        
        // Process the bold part
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(boldText, { 
          continued: parts.length > 1 && parts[1].trim().length > 0,
          align: alignMode as any
        });
        
        // If there's text after bold
        if (parts.length > 1 && parts[1].trim().length > 0) {
          doc.fontSize(12).font('Helvetica');
          doc.text(parts[1].replace(/<[^>]*>/g, '').trim(), {
            align: alignMode as any
          });
        }
        
        break; // Handle just the first bold tag for now
      }
    } else {
      // No bold tags, just render the paragraph
      const plainText = pContent.replace(/<[^>]*>/g, '').trim();
      if (plainText) {
        doc.fontSize(12).font('Helvetica');
        doc.text(plainText, { align: alignMode as any });
      }
    }
    
    doc.moveDown();
  }
}

// Helper function to add the projects and jobs table
function addProjectsJobsTable(
  doc: PDFKit.PDFDocument, 
  jobsData: Array<{project: string, title: string, description: string, status: string, price: number}>, 
  totalJobsCost: number, 
  invoice: any
) {
  // Draw table headers
  const tableTop = doc.y;
  const tableHeaders = ['Project', 'Job', 'Description', 'Status', 'Price'];
  const columnWidths = [100, 100, 150, 80, 70];
  let currentY = tableTop;
  
  // Only add table if there are jobs
  if (jobsData.length === 0) {
    doc.fontSize(12).text('No projects or jobs found for this invoice.');
    return;
  }
  
  doc.fontSize(14).text('Projects and Jobs', { underline: true });
  doc.moveDown();
  
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
  for (const job of jobsData) {
    // Check if we need a new page
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }
    
    // Job row
    let x = 50;
    doc.text(job.project, x, currentY);
    x += columnWidths[0];
    doc.text(job.title, x, currentY);
    x += columnWidths[1];
    doc.text(job.description, x, currentY, { width: columnWidths[2] - 10 });
    x += columnWidths[2];
    doc.text(job.status, x, currentY);
    x += columnWidths[3];
    doc.text(`$${job.price.toFixed(2)}`, x, currentY);
    
    // Move down for next row, accounting for multi-line descriptions
    const textHeight = doc.heightOfString(job.description, { width: columnWidths[2] - 10 });
    currentY += Math.max(textHeight, 20) + 10;
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
} 