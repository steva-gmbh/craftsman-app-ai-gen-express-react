import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getJobMaterials = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const materials = await prisma.jobMaterial.findMany({
      where: {
        jobId: Number(jobId),
      },
      include: {
        material: true,
      },
    });
    res.json(materials);
  } catch (error) {
    console.error('Error fetching job materials:', error);
    res.status(500).json({ error: 'Failed to fetch job materials' });
  }
};

export const addJobMaterial = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { materialId, amount } = req.body;

    // Check if the material is already added to the job
    const existingMaterial = await prisma.jobMaterial.findUnique({
      where: {
        jobId_materialId: {
          jobId: Number(jobId),
          materialId: Number(materialId),
        },
      },
    });

    if (existingMaterial) {
      return res.status(400).json({ error: 'Material already added to this job' });
    }

    const jobMaterial = await prisma.jobMaterial.create({
      data: {
        jobId: Number(jobId),
        materialId: Number(materialId),
        amount: Number(amount),
      },
      include: {
        material: true,
      },
    });

    res.json(jobMaterial);
  } catch (error) {
    console.error('Error adding material to job:', error);
    res.status(500).json({ error: 'Failed to add material to job' });
  }
};

export const updateJobMaterial = async (req: Request, res: Response) => {
  try {
    const { jobId, materialId } = req.params;
    const { amount } = req.body;

    const jobMaterial = await prisma.jobMaterial.update({
      where: {
        jobId_materialId: {
          jobId: Number(jobId),
          materialId: Number(materialId),
        },
      },
      data: {
        amount: Number(amount),
      },
      include: {
        material: true,
      },
    });

    res.json(jobMaterial);
  } catch (error) {
    console.error('Error updating job material:', error);
    res.status(500).json({ error: 'Failed to update job material' });
  }
};

export const removeJobMaterial = async (req: Request, res: Response) => {
  try {
    const { jobId, materialId } = req.params;

    await prisma.jobMaterial.delete({
      where: {
        jobId_materialId: {
          jobId: Number(jobId),
          materialId: Number(materialId),
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error removing material from job:', error);
    res.status(500).json({ error: 'Failed to remove material from job' });
  }
}; 