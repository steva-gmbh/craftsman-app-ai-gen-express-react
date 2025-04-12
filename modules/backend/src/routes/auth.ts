import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In a real app, we would hash the password and compare with the stored hash
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In a real app, we would generate and return a JWT token here
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user and their default settings in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password, // In a real app, this would be hashed
          name,
          role: 'user',
        },
      });

      // Create default settings for the user
      await tx.settings.create({
        data: {
          userId: user.id,
          profile: JSON.stringify({ name: user.name, email: user.email }),
          business: JSON.stringify({ name: '', services: [] }),
          notifications: JSON.stringify({ email: true, sms: false }),
          appearance: JSON.stringify({ theme: 'light' }),
        },
      });

      return user;
    });

    res.status(201).json({
      id: result.id,
      email: result.email,
      name: result.name,
      role: result.role,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 