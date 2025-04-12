import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo tools
  const tools = [
    {
      name: 'Cordless Drill',
      description: '18V Lithium-Ion cordless drill with 2 batteries',
      category: 'Power Tools',
      brand: 'Bosch',
      model: 'GSB 18V-50',
      purchaseDate: new Date('2023-01-15'),
      purchasePrice: 129.99,
      location: 'Tool Cabinet A',
      notes: 'Includes 2 batteries and charger'
    },
    {
      name: 'Circular Saw',
      description: '7-1/4 inch circular saw with laser guide',
      category: 'Power Tools',
      brand: 'Makita',
      model: 'HS7601J',
      purchaseDate: new Date('2023-02-20'),
      purchasePrice: 149.99,
      location: 'Tool Cabinet B',
      notes: 'Includes 2 blades and carrying case'
    },
    {
      name: 'Measuring Tape',
      description: '25ft measuring tape with magnetic hook',
      category: 'Measuring Tools',
      brand: 'Stanley',
      model: 'PowerLock 25ft',
      purchaseDate: new Date('2023-03-10'),
      purchasePrice: 12.99,
      location: 'Tool Belt',
      notes: 'Daily use tool'
    },
    {
      name: 'Safety Glasses',
      description: 'Clear safety glasses with UV protection',
      category: 'Safety Equipment',
      brand: '3M',
      model: 'SecureFit',
      purchaseDate: new Date('2023-04-05'),
      purchasePrice: 8.99,
      location: 'Safety Cabinet',
      notes: '5 pairs available'
    },
    {
      name: 'Garden Shovel',
      description: 'Stainless steel garden shovel with wooden handle',
      category: 'Garden Tools',
      brand: 'Fiskars',
      model: 'Solid',
      purchaseDate: new Date('2023-05-12'),
      purchasePrice: 24.99,
      location: 'Garden Shed',
      notes: 'Used for planting and digging'
    }
  ];

  for (const tool of tools) {
    try {
      await prisma.tool.create({
        data: tool
      });
    } catch (error) {
      console.error(`Failed to create tool ${tool.name}:`, error);
    }
  }

  console.log('Demo tools created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 