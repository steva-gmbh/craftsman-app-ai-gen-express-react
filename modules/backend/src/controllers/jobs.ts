import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getJobs = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.job.count();
    
    // Get paginated jobs
    const jobs = await prisma.job.findMany({
      skip,
      take: limit,
      include: {
        customer: true,
        project: true,
        materials: true,
        tools: true,
      },
      orderBy: { id: 'asc' }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Return paginated response
    res.json({
      data: jobs,
      totalCount,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        customer: true,
        project: true,
        materials: {
          include: {
            material: true,
          },
        },
        tools: {
          include: {
            tool: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, description, status, customerId, projectId, price, startDate, endDate } = req.body;
    const job = await prisma.job.create({
      data: {
        title,
        description,
        status,
        customerId: Number(customerId),
        projectId: projectId ? Number(projectId) : undefined,
        price: price ? Number(price) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        customer: true,
        project: true,
        materials: {
          include: {
            material: true,
          },
        },
        tools: {
          include: {
            tool: true,
          },
        },
      },
    });
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, customerId, projectId, price, startDate, endDate } = req.body;
    const job = await prisma.job.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
        status,
        customerId: Number(customerId),
        projectId: projectId ? Number(projectId) : null,
        price: price ? Number(price) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        customer: true,
        project: true,
        materials: {
          include: {
            material: true,
          },
        },
        tools: {
          include: {
            tool: true,
          },
        },
      },
    });
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jobId = Number(id);

    // First check if the job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        materials: true,
        tools: true
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Delete job-material associations first
    if (job.materials.length > 0) {
      await prisma.jobMaterial.deleteMany({
        where: { jobId }
      });
    }

    // Delete job-tool associations
    if (job.tools.length > 0) {
      await prisma.jobTool.deleteMany({
        where: { jobId }
      });
    }
    
    // Now delete the job
    await prisma.job.delete({
      where: { id: jobId },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

// Job Material controllers
export const getJobMaterials = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jobId = Number(id);
    
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        materials: {
          include: {
            material: true
          }
        }
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job.materials);
  } catch (error) {
    console.error('Error fetching job materials:', error);
    res.status(500).json({ error: 'Failed to fetch job materials' });
  }
};

export const addJobMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { materialId, amount } = req.body;
    const jobId = Number(id);
    
    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if material exists
    const material = await prisma.material.findUnique({
      where: { id: Number(materialId) }
    });
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Check if association already exists
    const existingAssociation = await prisma.jobMaterial.findFirst({
      where: {
        jobId,
        materialId: Number(materialId)
      }
    });
    
    let jobMaterial;
    if (existingAssociation) {
      // Update the existing association instead of returning an error
      jobMaterial = await prisma.jobMaterial.update({
        where: {
          id: existingAssociation.id
        },
        data: {
          amount: Number(amount)
        },
        include: {
          material: true
        }
      });
    } else {
      // Create new association
      jobMaterial = await prisma.jobMaterial.create({
        data: {
          jobId,
          materialId: Number(materialId),
          amount: Number(amount)
        },
        include: {
          material: true
        }
      });
    }
    
    res.status(201).json(jobMaterial);
  } catch (error) {
    console.error('Error adding material to job:', error);
    res.status(500).json({ error: 'Failed to add material to job' });
  }
};

// Job Tool controllers
export const getJobTools = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jobId = Number(id);
    
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        tools: {
          include: {
            tool: true
          }
        }
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job.tools);
  } catch (error) {
    console.error('Error fetching job tools:', error);
    res.status(500).json({ error: 'Failed to fetch job tools' });
  }
};

export const addJobTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { toolId, amount } = req.body;
    const jobId = Number(id);
    
    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if tool exists
    const tool = await prisma.tool.findUnique({
      where: { id: Number(toolId) }
    });
    
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    
    // Check if association already exists
    const existingAssociation = await prisma.jobTool.findFirst({
      where: {
        jobId,
        toolId: Number(toolId)
      }
    });
    
    let jobTool;
    if (existingAssociation) {
      // Update the existing association instead of returning an error
      jobTool = await prisma.jobTool.update({
        where: {
          id: existingAssociation.id
        },
        data: {
          amount: Number(amount)
        },
        include: {
          tool: true
        }
      });
    } else {
      // Create new association
      jobTool = await prisma.jobTool.create({
        data: {
          jobId,
          toolId: Number(toolId),
          amount: Number(amount)
        },
        include: {
          tool: true
        }
      });
    }
    
    res.status(201).json(jobTool);
  } catch (error) {
    console.error('Error adding tool to job:', error);
    res.status(500).json({ error: 'Failed to add tool to job' });
  }
}; 