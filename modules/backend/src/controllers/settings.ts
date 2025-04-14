import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findMany({
      include: {
        user: true,
      },
    });
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const getSettingsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const settings = await prisma.settings.findUnique({
      where: {
        userId: Number(userId),
      },
      include: {
        user: true,
      },
    });

    if (!settings) {
      // If settings don't exist, get the user first
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create default settings for the user
      const newSettings = await prisma.settings.create({
        data: {
          userId: Number(userId),
          profile: JSON.stringify({ name: user.name, email: user.email }),
          business: JSON.stringify({ name: '', services: [] }),
          notifications: JSON.stringify({ email: true, sms: false }),
          appearance: JSON.stringify({ theme: 'light' }),
          pagination: JSON.stringify({ rowsPerPage: 10 }),
        },
        include: {
          user: true,
        },
      });

      return res.json(newSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const createSettings = async (req: Request, res: Response) => {
  try {
    const { userId, profile, business, billing, notifications, appearance, pagination } = req.body;
    const settings = await prisma.settings.create({
      data: {
        userId: Number(userId),
        profile,
        business,
        billing,
        notifications,
        appearance,
        pagination,
      },
      include: {
        user: true,
      },
    });
    res.status(201).json(settings);
  } catch (error) {
    console.error('Error creating settings:', error);
    res.status(500).json({ error: 'Failed to create settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { profile, business, billing, notifications, appearance, pagination } = req.body;

    // First check if settings exist
    const existingSettings = await prisma.settings.findUnique({
      where: {
        userId: Number(userId),
      },
    });

    let settings;
    if (!existingSettings) {
      // If settings don't exist, create them
      settings = await prisma.settings.create({
        data: {
          userId: Number(userId),
          profile,
          business,
          billing,
          notifications,
          appearance,
          pagination,
        },
        include: {
          user: true,
        },
      });
    } else {
      // If settings exist, update them
      settings = await prisma.settings.update({
        where: {
          userId: Number(userId),
        },
        data: {
          profile,
          business,
          billing,
          notifications,
          appearance,
          pagination,
        },
        include: {
          user: true,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const deleteSettings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await prisma.settings.delete({
      where: {
        userId: Number(userId),
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting settings:', error);
    res.status(500).json({ error: 'Failed to delete settings' });
  }
}; 