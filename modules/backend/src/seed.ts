import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.job.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

  // Create default user with specific ID
  const user = await prisma.user.create({
    data: {
      id: 1, // Force ID to be 1
      email: 'admin@example.com',
      password: 'password', // In a real app, this should be hashed
      name: 'Admin User',
      role: 'admin',
    },
  });

  // Create default settings for the user
  await prisma.settings.create({
    data: {
      userId: 1,
      profile: JSON.stringify({ name: 'Admin User', email: 'admin@example.com' }),
      business: JSON.stringify({ name: 'My Business', services: [] }),
      notifications: JSON.stringify({ email: true, sms: false }),
      appearance: JSON.stringify({ theme: 'light' }),
    },
  });

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: '123 Main St, Anytown, USA',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '987-654-3210',
      address: '456 Oak Ave, Somewhere, USA',
    },
  });

  // Create jobs
  await prisma.job.create({
    data: {
      title: 'Website Redesign',
      description: 'Complete redesign of company website',
      status: 'IN_PROGRESS',
      customerId: customer1.id,
    },
  });

  await prisma.job.create({
    data: {
      title: 'Mobile App Development',
      description: 'New mobile application for iOS and Android',
      status: 'PENDING',
      customerId: customer1.id,
    },
  });

  await prisma.job.create({
    data: {
      title: 'Database Migration',
      description: 'Migrate legacy database to new system',
      status: 'COMPLETED',
      customerId: customer2.id,
    },
  });

  console.log('Database has been seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 