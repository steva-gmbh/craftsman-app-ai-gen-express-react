import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in correct order to respect foreign key constraints
  await prisma.jobMaterial.deleteMany();
  await prisma.material.deleteMany();
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
      pagination: JSON.stringify({ rowsPerPage: 10 }),
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

  // Create materials
  await prisma.material.createMany({
    data: [
      {
        name: 'White Paint',
        description: 'Premium quality white wall paint',
        unit: 'l',
        costPerUnit: 25.99,
        color: 'White',
        brand: 'Premium Paints',
        category: 'Paint',
        stock: 50,
        minStock: 10,
        location: 'Storage Room A',
      },
      {
        name: 'Wooden Planks',
        description: 'Oak wooden planks for flooring',
        unit: 'm',
        costPerUnit: 15.50,
        category: 'Wood',
        stock: 200,
        minStock: 50,
        location: 'Storage Room B',
      },
      {
        name: 'Concrete Mix',
        description: 'Quick-drying concrete mix',
        unit: 'kg',
        costPerUnit: 0.75,
        category: 'Concrete',
        stock: 1000,
        minStock: 200,
        location: 'Outdoor Storage',
      },
      {
        name: 'Electrical Wires',
        description: 'Copper electrical wires',
        unit: 'm',
        costPerUnit: 2.99,
        category: 'Electrical',
        stock: 500,
        minStock: 100,
        location: 'Storage Room C',
      },
      {
        name: 'PVC Pipes',
        description: 'Standard PVC pipes for plumbing',
        unit: 'm',
        costPerUnit: 5.25,
        category: 'Plumbing',
        stock: 300,
        minStock: 50,
        location: 'Storage Room D',
      },
    ],
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