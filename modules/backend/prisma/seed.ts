import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo users
  const users = [
    {
      email: 'admin@example.com',
      password: '$2b$10$nriKnp/pmg/D41MYV.jC3O/dFd.qTuGSUQYZHaw27Lg39D/tC.DWW', // hashed "password"
      name: 'Admin User',
      role: 'admin'
    },
    {
      email: 'user@example.com',
      password: '$2b$10$nriKnp/pmg/D41MYV.jC3O/dFd.qTuGSUQYZHaw27Lg39D/tC.DWW', // hashed "password"
      name: 'Regular User',
      role: 'user'
    }
  ];

  // Create users
  for (const user of users) {
    try {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user,
      });
      console.log(`Created/updated user ${user.email}`);
    } catch (error) {
      console.error(`Failed to create/update user ${user.email}:`, error);
    }
  }

  // Create demo tools and store their IDs
  const toolIds: { [key: string]: number } = {};
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
      const createdTool = await prisma.tool.create({
        data: tool
      });
      toolIds[tool.name] = createdTool.id;
    } catch (error) {
      console.error(`Failed to create tool ${tool.name}:`, error);
    }
  }

  console.log('Demo tools created successfully');

  // Create demo materials and store their IDs
  const materialIds: { [key: string]: number } = {};
  const materials = [
    {
      name: 'Red Paint',
      description: 'Premium interior wall paint, matte finish',
      category: 'Paints',
      brand: 'Sherwin-Williams',
      unit: 'gallons',
      costPerUnit: 39.99,
      color: 'Red',
      supplier: 'Sherwin-Williams Store',
      stock: 5,
      minStock: 2,
      location: 'Paint Storage',
      notes: 'For living room accent wall'
    },
    {
      name: 'Wool Carpet',
      description: 'High-quality wool carpet, beige color',
      category: 'Flooring',
      brand: 'Shaw',
      unit: 'square feet',
      costPerUnit: 4.99,
      color: 'Beige',
      supplier: 'Flooring World',
      stock: 200,
      minStock: 50,
      location: 'Storage Room',
      notes: 'For master bedroom'
    },
    {
      name: 'Ceramic Tiles',
      description: '12x12 inch ceramic floor tiles, white',
      category: 'Flooring',
      brand: 'Daltile',
      unit: 'boxes',
      costPerUnit: 29.99,
      color: 'White',
      supplier: 'Tile Depot',
      stock: 100,
      minStock: 20,
      location: 'Tile Storage',
      notes: 'For kitchen renovation'
    },
    {
      name: '2x4 Lumber',
      description: 'Pressure-treated pine lumber',
      category: 'Lumber',
      brand: 'Home Depot',
      unit: 'pieces',
      costPerUnit: 3.99,
      supplier: 'Home Depot',
      stock: 50,
      minStock: 10,
      location: 'Lumber Yard',
      notes: 'For deck construction'
    },
    {
      name: 'Drywall Sheets',
      description: '4x8 foot drywall sheets, 1/2 inch thick',
      category: 'Building Materials',
      brand: 'USG',
      unit: 'sheets',
      costPerUnit: 12.99,
      supplier: 'Building Supply Co',
      stock: 20,
      minStock: 5,
      location: 'Material Storage',
      notes: 'For basement finishing'
    },
    {
      name: 'Copper Pipes',
      description: '1/2 inch Type L copper pipes',
      category: 'Plumbing',
      brand: 'Mueller',
      unit: 'feet',
      costPerUnit: 2.49,
      supplier: 'Plumbing Supply Co',
      stock: 100,
      minStock: 25,
      location: 'Plumbing Storage',
      notes: 'For bathroom renovation'
    },
    {
      name: 'Electrical Wire',
      description: '12/2 NM-B Romex wire',
      category: 'Electrical',
      brand: 'Southwire',
      unit: 'feet',
      costPerUnit: 0.89,
      supplier: 'Electrical Supply',
      stock: 500,
      minStock: 100,
      location: 'Electrical Cabinet',
      notes: 'For general wiring'
    },
    {
      name: 'PVC Cement',
      description: 'Clear PVC solvent cement',
      category: 'Plumbing',
      brand: 'Oatey',
      unit: 'bottles',
      costPerUnit: 8.99,
      supplier: 'Plumbing Supply Co',
      stock: 10,
      minStock: 3,
      location: 'Chemical Storage',
      notes: 'For PVC pipe connections'
    },
    {
      name: 'Concrete Mix',
      description: '60 lb. fast-setting concrete mix',
      category: 'Concrete',
      brand: 'Quikrete',
      unit: 'bags',
      costPerUnit: 5.99,
      supplier: 'Building Supply Co',
      stock: 30,
      minStock: 10,
      location: 'Outdoor Storage',
      notes: 'For small concrete projects'
    },
    {
      name: 'Roofing Shingles',
      description: 'Architectural asphalt shingles, charcoal',
      category: 'Roofing',
      brand: 'GAF',
      unit: 'bundles',
      costPerUnit: 32.99,
      color: 'Charcoal',
      supplier: 'Roofing Supply',
      stock: 50,
      minStock: 15,
      location: 'Roofing Storage',
      notes: 'For roof replacement'
    },
    {
      name: 'Insulation Batts',
      description: 'R-13 fiberglass insulation batts',
      category: 'Insulation',
      brand: 'Owens Corning',
      unit: 'batts',
      costPerUnit: 1.29,
      supplier: 'Building Supply Co',
      stock: 100,
      minStock: 30,
      location: 'Insulation Storage',
      notes: 'For wall insulation'
    },
    {
      name: 'Door Hinges',
      description: '3.5 inch brass door hinges',
      category: 'Hardware',
      brand: 'Stanley',
      unit: 'pairs',
      costPerUnit: 4.99,
      supplier: 'Hardware Store',
      stock: 25,
      minStock: 10,
      location: 'Hardware Cabinet',
      notes: 'For interior doors'
    },
    {
      name: 'Window Caulk',
      description: 'Exterior window and door sealant',
      category: 'Sealants',
      brand: 'DAP',
      unit: 'tubes',
      costPerUnit: 6.99,
      supplier: 'Building Supply Co',
      stock: 15,
      minStock: 5,
      location: 'Sealant Storage',
      notes: 'For window installation'
    },
    {
      name: 'Deck Screws',
      description: '3 inch coated deck screws',
      category: 'Fasteners',
      brand: 'GRK',
      unit: 'boxes',
      costPerUnit: 24.99,
      supplier: 'Hardware Store',
      stock: 10,
      minStock: 3,
      location: 'Fastener Cabinet',
      notes: 'For deck construction'
    },
    {
      name: 'Wall Anchors',
      description: 'Heavy-duty wall anchors',
      category: 'Hardware',
      brand: 'TOGGLER',
      unit: 'packs',
      costPerUnit: 8.99,
      supplier: 'Hardware Store',
      stock: 20,
      minStock: 5,
      location: 'Hardware Cabinet',
      notes: 'For hanging heavy items'
    },
    {
      name: 'Grout',
      description: 'Sanded tile grout, white',
      category: 'Tile',
      brand: 'Custom Building Products',
      unit: 'pounds',
      costPerUnit: 12.99,
      color: 'White',
      supplier: 'Tile Depot',
      stock: 15,
      minStock: 5,
      location: 'Tile Storage',
      notes: 'For tile installation'
    },
    {
      name: 'Weather Stripping',
      description: 'Self-adhesive foam weather stripping',
      category: 'Weatherproofing',
      brand: 'Frost King',
      unit: 'rolls',
      costPerUnit: 5.99,
      supplier: 'Hardware Store',
      stock: 10,
      minStock: 3,
      location: 'Weatherproofing Storage',
      notes: 'For door and window sealing'
    },
    {
      name: 'Circuit Breakers',
      description: '20 Amp single-pole circuit breakers',
      category: 'Electrical',
      brand: 'Square D',
      unit: 'pieces',
      costPerUnit: 7.99,
      supplier: 'Electrical Supply',
      stock: 15,
      minStock: 5,
      location: 'Electrical Cabinet',
      notes: 'For panel upgrades'
    },
    {
      name: 'Plywood',
      description: '3/4 inch CDX plywood',
      category: 'Lumber',
      brand: 'Georgia-Pacific',
      unit: 'sheets',
      costPerUnit: 45.99,
      supplier: 'Building Supply Co',
      stock: 25,
      minStock: 8,
      location: 'Lumber Yard',
      notes: 'For subflooring'
    },
    {
      name: 'Door Knobs',
      description: 'Modern satin nickel door knobs',
      category: 'Hardware',
      brand: 'Schlage',
      unit: 'sets',
      costPerUnit: 29.99,
      supplier: 'Hardware Store',
      stock: 10,
      minStock: 3,
      location: 'Hardware Cabinet',
      notes: 'For interior doors'
    },
    {
      name: 'Drain Cleaner',
      description: 'Professional-grade drain cleaner',
      category: 'Plumbing',
      brand: 'Liquid-Plumr',
      unit: 'bottles',
      costPerUnit: 12.99,
      supplier: 'Plumbing Supply Co',
      stock: 8,
      minStock: 2,
      location: 'Chemical Storage',
      notes: 'For clogged drains'
    },
    {
      name: 'Paint Brushes',
      description: 'Professional paint brush set',
      category: 'Painting',
      brand: 'Purdy',
      unit: 'sets',
      costPerUnit: 24.99,
      supplier: 'Paint Store',
      stock: 5,
      minStock: 2,
      location: 'Paint Storage',
      notes: 'For detailed painting work'
    },
    {
      name: 'Concrete Sealer',
      description: 'Penetrating concrete sealer',
      category: 'Concrete',
      brand: 'Foundation Armor',
      unit: 'gallons',
      costPerUnit: 49.99,
      supplier: 'Building Supply Co',
      stock: 4,
      minStock: 1,
      location: 'Chemical Storage',
      notes: 'For concrete protection'
    },
    {
      name: 'LED Light Bulbs',
      description: '60W equivalent LED bulbs',
      category: 'Electrical',
      brand: 'Philips',
      unit: 'packs',
      costPerUnit: 14.99,
      supplier: 'Electrical Supply',
      stock: 20,
      minStock: 5,
      location: 'Lighting Storage',
      notes: 'For energy-efficient lighting'
    },
    {
      name: 'Silicone Sealant',
      description: '100% silicone sealant, clear',
      category: 'Sealants',
      brand: 'GE',
      unit: 'tubes',
      costPerUnit: 7.99,
      supplier: 'Building Supply Co',
      stock: 12,
      minStock: 3,
      location: 'Sealant Storage',
      notes: 'For bathroom and kitchen sealing'
    },
    {
      name: 'Wall Plugs',
      description: 'Assorted wall plugs and anchors',
      category: 'Hardware',
      brand: 'E-Z Ancor',
      unit: 'packs',
      costPerUnit: 6.99,
      supplier: 'Hardware Store',
      stock: 15,
      minStock: 5,
      location: 'Hardware Cabinet',
      notes: 'For various wall mounting needs'
    },
    {
      name: 'Pipe Insulation',
      description: 'Self-sealing pipe insulation',
      category: 'Insulation',
      brand: 'Frost King',
      unit: 'feet',
      costPerUnit: 1.29,
      supplier: 'Plumbing Supply Co',
      stock: 100,
      minStock: 25,
      location: 'Insulation Storage',
      notes: 'For pipe freeze protection'
    },
    {
      name: 'Wood Stain',
      description: 'Oil-based wood stain, dark walnut',
      category: 'Finishing',
      brand: 'Minwax',
      unit: 'quarts',
      costPerUnit: 12.99,
      color: 'Dark Walnut',
      supplier: 'Paint Store',
      stock: 8,
      minStock: 2,
      location: 'Paint Storage',
      notes: 'For wood finishing'
    },
    {
      name: 'Drywall Compound',
      description: 'All-purpose drywall compound',
      category: 'Drywall',
      brand: 'USG',
      unit: 'buckets',
      costPerUnit: 14.99,
      supplier: 'Building Supply Co',
      stock: 10,
      minStock: 3,
      location: 'Drywall Storage',
      notes: 'For drywall finishing'
    }
  ];

  for (const material of materials) {
    try {
      const createdMaterial = await prisma.material.create({
        data: material
      });
      materialIds[material.name] = createdMaterial.id;
    } catch (error) {
      console.error(`Failed to create material ${material.name}:`, error);
    }
  }

  console.log('Demo materials created successfully');

  // Create demo customers
  const customers = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-123-4567',
      address: '123 Main St, Anytown, USA',
      billingAddress: '123 Main St, Anytown, USA',
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '555-234-5678',
      address: '456 Oak Ave, Somewhere, USA',
      billingAddress: '456 Oak Ave, Somewhere, USA',
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '555-345-6789',
      address: '789 Pine Rd, Nowhere, USA',
      billingAddress: '789 Pine Rd, Nowhere, USA',
    },
  ];

  // Create customers and store their IDs
  const customerIds: { [key: string]: number } = {};
  for (const customer of customers) {
    try {
      const createdCustomer = await prisma.customer.upsert({
        where: { email: customer.email },
        update: customer,
        create: customer,
      });
      customerIds[customer.name] = createdCustomer.id;
    } catch (error) {
      console.error(`Failed to create/update customer ${customer.name}:`, error);
    }
  }

  console.log('Demo customers created successfully');

  // Create demo projects
  const projects = [
    {
      name: 'Smith Residence Renovation',
      description: 'Full home renovation including kitchen, bathroom, and basement',
      status: 'active',
      budget: 75000.00,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      customerName: 'John Smith'
    },
    {
      name: 'Johnson House Remodel',
      description: 'Exterior updates including roof, windows, and landscaping',
      status: 'active',
      budget: 45000.00,
      startDate: new Date('2024-02-10'),
      endDate: new Date('2024-05-25'),
      customerName: 'Sarah Johnson'
    },
    {
      name: 'Brown Kitchen Upgrade',
      description: 'Modern kitchen with new appliances and open concept design',
      status: 'active',
      budget: 35000.00,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-04-30'),
      customerName: 'Michael Brown'
    },
    {
      name: 'Smith Backyard Oasis',
      description: 'Complete backyard transformation with deck, patio, and landscaping',
      status: 'on_hold',
      budget: 28000.00,
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-07-15'),
      customerName: 'John Smith'
    },
    {
      name: 'Johnson Basement Conversion',
      description: 'Converting unfinished basement into entertainment space and home office',
      status: 'active',
      budget: 42000.00,
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-06-10'),
      customerName: 'Sarah Johnson'
    }
  ];

  // Create projects and store their IDs
  const projectIds: { [key: string]: number } = {};
  for (const project of projects) {
    try {
      const createdProject = await prisma.project.create({
        data: {
          name: project.name,
          description: project.description,
          status: project.status,
          budget: project.budget,
          startDate: project.startDate,
          endDate: project.endDate,
          customer: {
            connect: { id: customerIds[project.customerName] },
          }
        }
      });
      projectIds[project.name] = createdProject.id;
    } catch (error) {
      console.error(`Failed to create project ${project.name}:`, error);
    }
  }

  console.log('Demo projects created successfully');

  // Create demo invoices
  const invoices = [
    {
      invoiceNumber: "INV-2024-001",
      issueDate: new Date('2024-02-15'),
      dueDate: new Date('2024-03-15'),
      status: "paid",
      totalAmount: 15000.00,
      taxRate: 0.07,
      taxAmount: 1050.00,
      notes: "Initial payment for Smith Residence Renovation",
      customerName: "John Smith",
      projectNames: ["Smith Residence Renovation"]
    },
    {
      invoiceNumber: "INV-2024-002",
      issueDate: new Date('2024-02-20'),
      dueDate: new Date('2024-03-20'),
      status: "paid",
      totalAmount: 12000.00,
      taxRate: 0.07,
      taxAmount: 840.00,
      notes: "Initial payment for Johnson House Remodel",
      customerName: "Sarah Johnson",
      projectNames: ["Johnson House Remodel"]
    },
    {
      invoiceNumber: "INV-2024-003",
      issueDate: new Date('2024-03-05'),
      dueDate: new Date('2024-04-05'),
      status: "sent",
      totalAmount: 10000.00,
      taxRate: 0.07,
      taxAmount: 700.00,
      notes: "Initial payment for Brown Kitchen Upgrade",
      customerName: "Michael Brown",
      projectNames: ["Brown Kitchen Upgrade"]
    },
    {
      invoiceNumber: "INV-2024-004",
      issueDate: new Date('2024-04-01'),
      dueDate: new Date('2024-05-01'),
      status: "draft",
      totalAmount: 20000.00,
      taxRate: 0.07,
      taxAmount: 1400.00,
      notes: "Second payment for Smith Residence Renovation",
      customerName: "John Smith",
      projectNames: ["Smith Residence Renovation"]
    },
    {
      invoiceNumber: "INV-2024-005",
      issueDate: new Date('2024-04-10'),
      dueDate: new Date('2024-05-10'),
      status: "draft",
      totalAmount: 8000.00,
      taxRate: 0.07,
      taxAmount: 560.00,
      notes: "Johnson Basement project progress payment",
      customerName: "Sarah Johnson",
      projectNames: ["Johnson Basement Conversion"]
    }
  ];

  // Create invoices
  const invoiceIds: { [key: string]: number } = {};
  for (const invoice of invoices) {
    try {
      const createdInvoice = await prisma.invoice.upsert({
        where: { invoiceNumber: invoice.invoiceNumber },
        update: {
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          totalAmount: invoice.totalAmount,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxAmount,
          notes: invoice.notes,
          customer: {
            connect: { id: customerIds[invoice.customerName] }
          }
        },
        create: {
          invoiceNumber: invoice.invoiceNumber,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          totalAmount: invoice.totalAmount,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxAmount,
          notes: invoice.notes,
          customer: {
            connect: { id: customerIds[invoice.customerName] }
          }
        }
      });
      
      // Connect projects to invoice
      for (const projectName of invoice.projectNames) {
        await prisma.project.update({
          where: { id: projectIds[projectName] },
          data: {
            invoiceId: createdInvoice.id
          }
        });
      }
      
      invoiceIds[invoice.invoiceNumber] = createdInvoice.id;
    } catch (error) {
      console.error(`Failed to create invoice ${invoice.invoiceNumber}:`, error);
    }
  }

  console.log('Demo invoices created successfully');

  // Create demo jobs with proper customer connections
  const jobs = [
    {
      title: 'Kitchen Renovation',
      description: 'Complete kitchen renovation including new cabinets, countertops, and flooring',
      status: 'in_progress',
      price: 25000,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-04-15'),
      customerName: 'John Smith',
      projectName: 'Smith Residence Renovation',
      tools: [
        { toolName: 'Cordless Drill', amount: 2 },
        { toolName: 'Circular Saw', amount: 1 },
        { toolName: 'Measuring Tape', amount: 2 }
      ],
      materials: [
        { materialName: 'Ceramic Tiles', amount: 50 },
        { materialName: 'Electrical Wire', amount: 10 },
        { materialName: 'Drywall Sheets', amount: 30 }
      ]
    },
    {
      title: 'Bathroom Remodel',
      description: 'Full bathroom remodel with new fixtures, tiling, and plumbing',
      status: 'pending',
      price: 15000.00,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-05-15'),
      customerName: 'Sarah Johnson',
      projectName: 'Johnson House Remodel',
      tools: [
        { toolName: 'Cordless Drill', amount: 1 },
        { toolName: 'Measuring Tape', amount: 1 }
      ],
      materials: [
        { materialName: 'Copper Pipes', amount: 50 },
        { materialName: 'PVC Cement', amount: 2 },
        { materialName: 'Silicone Sealant', amount: 30 }
      ]
    },
    {
      title: 'Deck Construction',
      description: 'New 20x30 foot deck with pressure-treated lumber',
      status: 'completed',
      price: 12000.00,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-28'),
      customerName: 'Michael Brown',
      projectName: 'Brown Kitchen Upgrade',
      tools: [
        { toolName: 'Circular Saw', amount: 1 },
        { toolName: 'Measuring Tape', amount: 2 }
      ],
      materials: [
        { materialName: '2x4 Lumber', amount: 100 },
        { materialName: 'Deck Screws', amount: 5 }
      ]
    },
    {
      title: 'Basement Finishing',
      description: 'Complete basement finishing with drywall, flooring, and electrical work',
      status: 'in_progress',
      price: 30000.00,
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-05-30'),
      customerName: 'John Smith',
      projectName: 'Smith Residence Renovation',
      tools: [
        { toolName: 'Cordless Drill', amount: 2 },
        { toolName: 'Circular Saw', amount: 1 }
      ],
      materials: [
        { materialName: 'Drywall Sheets', amount: 50 },
        { materialName: 'Electrical Wire', amount: 200 },
        { materialName: 'Insulation Batts', amount: 60 }
      ]
    },
    {
      title: 'Roof Replacement',
      description: 'Complete roof replacement with architectural shingles',
      status: 'pending',
      price: 18000.00,
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-05-30'),
      customerName: 'Sarah Johnson',
      projectName: 'Johnson House Remodel',
      tools: [
        { toolName: 'Measuring Tape', amount: 1 }
      ],
      materials: [
        { materialName: 'Roofing Shingles', amount: 40 }
      ]
    },
    {
      title: 'Interior Painting',
      description: 'Painting of entire house interior with premium paint',
      status: 'pending',
      price: 8000.00,
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-05-15'),
      customerName: 'Michael Brown',
      projectName: 'Brown Kitchen Upgrade',
      tools: [
        { toolName: 'Safety Glasses', amount: 2 }
      ],
      materials: [
        { materialName: 'Red Paint', amount: 15 },
        { materialName: 'Paint Brushes', amount: 3 }
      ]
    },
    {
      title: 'Electrical Panel Upgrade',
      description: 'Upgrade to 200-amp service with new panel and breakers',
      status: 'in_progress',
      price: 5000.00,
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-03-25'),
      customerName: 'John Smith',
      projectName: 'Smith Residence Renovation',
      tools: [
        { toolName: 'Cordless Drill', amount: 1 }
      ],
      materials: [
        { materialName: 'Electrical Wire', amount: 100 },
        { materialName: 'Circuit Breakers', amount: 10 }
      ]
    },
    {
      title: 'Window Replacement',
      description: 'Replace all windows with energy-efficient models',
      status: 'completed',
      price: 15000.00,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      customerName: 'Sarah Johnson',
      projectName: 'Johnson House Remodel',
      tools: [
        { toolName: 'Measuring Tape', amount: 1 },
        { toolName: 'Safety Glasses', amount: 2 }
      ],
      materials: [
        { materialName: 'Window Caulk', amount: 10 },
        { materialName: 'Weather Stripping', amount: 5 }
      ]
    },
    {
      title: 'Concrete Patio',
      description: 'New 15x20 foot concrete patio with decorative finish',
      status: 'pending',
      price: 9000.00,
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-06-15'),
      customerName: 'Michael Brown',
      projectName: 'Brown Kitchen Upgrade',
      tools: [
        { toolName: 'Safety Glasses', amount: 1 }
      ],
      materials: [
        { materialName: 'Concrete Mix', amount: 40 },
        { materialName: 'Concrete Sealer', amount: 2 }
      ]
    },
    {
      title: 'Door Installation',
      description: 'Install new interior doors throughout the house',
      status: 'in_progress',
      price: 6000.00,
      startDate: new Date('2024-03-20'),
      endDate: new Date('2024-04-10'),
      customerName: 'John Smith',
      projectName: 'Smith Residence Renovation',
      tools: [
        { toolName: 'Cordless Drill', amount: 1 },
        { toolName: 'Measuring Tape', amount: 1 }
      ],
      materials: [
        { materialName: 'Door Knobs', amount: 20 },
        { materialName: 'Door Hinges', amount: 10 }
      ]
    },
    {
      title: 'Landscaping Renovation',
      description: 'Complete landscaping overhaul with new plants, mulch, and stone pathways',
      status: 'pending',
      price: 7500.00,
      startDate: new Date('2024-05-10'),
      endDate: new Date('2024-06-01'),
      customerName: 'John Smith',
      projectName: 'Smith Backyard Oasis',
      tools: [
        { toolName: 'Garden Shovel', amount: 3 },
        { toolName: 'Safety Glasses', amount: 2 }
      ],
      materials: [
        { materialName: 'Concrete Mix', amount: 10 }
      ]
    },
    {
      title: 'Custom Shelving',
      description: 'Built-in shelving for home office and living areas',
      status: 'completed',
      price: 4200.00,
      startDate: new Date('2024-02-05'),
      endDate: new Date('2024-02-20'),
      customerName: 'Sarah Johnson',
      projectName: 'Johnson Basement Conversion',
      tools: [
        { toolName: 'Circular Saw', amount: 1 },
        { toolName: 'Cordless Drill', amount: 1 }
      ],
      materials: [
        { materialName: 'Plywood', amount: 8 },
        { materialName: 'Wood Stain', amount: 2 }
      ]
    },
    {
      title: 'Home Theater Installation',
      description: 'Complete home theater setup with surround sound and projection system',
      status: 'in_progress',
      price: 12000.00,
      startDate: new Date('2024-03-25'),
      endDate: new Date('2024-04-15'),
      customerName: 'Sarah Johnson',
      projectName: 'Johnson Basement Conversion',
      tools: [
        { toolName: 'Cordless Drill', amount: 1 }
      ],
      materials: [
        { materialName: 'Electrical Wire', amount: 150 },
        { materialName: 'Wall Anchors', amount: 25 }
      ]
    },
    {
      title: 'Outdoor Kitchen',
      description: 'Built-in BBQ, countertops, and outdoor refrigerator',
      status: 'pending',
      price: 15000.00,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-07-15'),
      customerName: 'John Smith',
      projectName: 'Smith Backyard Oasis',
      tools: [
        { toolName: 'Cordless Drill', amount: 1 },
        { toolName: 'Circular Saw', amount: 1 },
        { toolName: 'Measuring Tape', amount: 1 }
      ],
      materials: [
        { materialName: 'Concrete Mix', amount: 30 },
        { materialName: 'Electrical Wire', amount: 100 },
        { materialName: 'Silicone Sealant', amount: 5 }
      ]
    },
    {
      title: 'Tile Backsplash',
      description: 'Install decorative tile backsplash in kitchen',
      status: 'completed',
      price: 2800.00,
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-03-15'),
      customerName: 'Michael Brown',
      projectName: 'Brown Kitchen Upgrade',
      tools: [
        { toolName: 'Safety Glasses', amount: 1 }
      ],
      materials: [
        { materialName: 'Ceramic Tiles', amount: 30 },
        { materialName: 'Grout', amount: 2 }
      ]
    }
  ];

  // Create jobs with proper customer and project connections
  for (const job of jobs) {
    try {
      const customerId = customerIds[job.customerName];
      if (!customerId) {
        console.error(`Customer ${job.customerName} not found for job ${job.title}`);
        continue;
      }

      // Get project ID if specified
      let projectId = undefined;
      if (job.projectName) {
        projectId = projectIds[job.projectName];
        if (!projectId) {
          console.error(`Project ${job.projectName} not found for job ${job.title}`);
          // Continue without project association rather than skipping the job entirely
        }
      }

      // First create the job
      const createdJob = await prisma.job.create({
        data: {
          title: job.title,
          description: job.description,
          status: job.status,
          price: job.price,
          startDate: job.startDate,
          endDate: job.endDate,
          customerId: customerId,
          projectId: projectId
        }
      });

      // Then create tool relationships
      if (Array.isArray(job.tools)) {
        for (const tool of job.tools) {
          const toolId = toolIds[tool.toolName];
          if (!toolId) {
            console.error(`Tool ${tool.toolName} not found for job ${job.title}`);
            continue;
          }
          await prisma.jobTool.create({
            data: {
              jobId: createdJob.id,
              toolId: toolId,
              amount: tool.amount
            }
          });
        }
      }

      // Then create material relationships
      if (Array.isArray(job.materials)) {
        for (const material of job.materials) {
          const materialId = materialIds[material.materialName];
          if (!materialId) {
            console.error(`Material ${material.materialName} not found for job ${job.title}`);
            continue;
          }
          await prisma.jobMaterial.create({
            data: {
              jobId: createdJob.id,
              materialId: materialId,
              amount: material.amount
            }
          });
        }
      }

    } catch (error) {
      console.error(`Failed to create job ${job.title}:`, error);
    }
  }

  console.log('Demo jobs created successfully');

  // Create demo vehicles
  const vehicles = [
    {
      name: 'Work Truck',
      make: 'Ford',
      model: 'F-150',
      year: 2022,
      licensePlate: 'WRK-1234',
      vin: 'ABC123XYZ456789D1',
      color: 'Blue',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2022-01-15'),
      purchasePrice: 45000,
      mileage: 12500,
      fuelType: 'gasoline',
      notes: 'Primary service vehicle'
    },
    {
      name: 'Delivery Van',
      make: 'Mercedes-Benz',
      model: 'Sprinter',
      year: 2021,
      licensePlate: 'DEL-5678',
      vin: 'XYZ987ABC654321E2',
      color: 'White',
      type: 'van',
      status: 'active',
      purchaseDate: new Date('2021-06-10'),
      purchasePrice: 52000,
      mileage: 25000,
      fuelType: 'diesel',
      notes: 'Used for material deliveries'
    },
    {
      name: 'Site Supervisor Vehicle',
      make: 'Toyota',
      model: 'Tacoma',
      year: 2023,
      licensePlate: 'SUP-9012',
      vin: 'DEF456GHI789012F3',
      color: 'Silver',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2023-02-20'),
      purchasePrice: 38000,
      mileage: 5000,
      fuelType: 'gasoline',
      notes: 'For site supervisor use'
    },
    {
      name: 'Compact Equipment Hauler',
      make: 'Chevrolet',
      model: 'Silverado 2500',
      year: 2020,
      licensePlate: 'HAUL-345',
      vin: 'JKL789MNO123456G4',
      color: 'Black',
      type: 'truck',
      status: 'maintenance',
      purchaseDate: new Date('2020-11-05'),
      purchasePrice: 48000,
      mileage: 35000,
      fuelType: 'diesel',
      notes: 'Currently in for transmission service'
    },
    {
      name: 'Electric Utility Vehicle',
      make: 'Tesla',
      model: 'Cybertruck',
      year: 2024,
      licensePlate: 'ELEC-001',
      vin: 'PQR123STU456789H5',
      color: 'Silver',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2024-01-10'),
      purchasePrice: 69000,
      mileage: 1200,
      fuelType: 'electric',
      notes: 'New electric vehicle for sustainable operations'
    }
  ];

  // Create the vehicles after the customers
  for (const vehicleData of vehicles) {
    try {
      // Check if vehicle with this VIN already exists
      if (vehicleData.vin) {
        const existingVehicle = await prisma.vehicle.findUnique({
          where: { vin: vehicleData.vin }
        });
        
        if (existingVehicle) {
          // Update existing vehicle
          await prisma.vehicle.update({
            where: { id: existingVehicle.id },
            data: vehicleData
          });
          console.log(`Updated vehicle ${vehicleData.name}`);
        } else {
          // Create new vehicle
          await prisma.vehicle.create({
            data: vehicleData
          });
          console.log(`Created vehicle ${vehicleData.name}`);
        }
      } else {
        // Handle vehicles without VIN
        const existingVehicle = await prisma.vehicle.findFirst({
          where: {
            name: vehicleData.name,
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year
          }
        });
        
        if (existingVehicle) {
          // Update existing vehicle
          await prisma.vehicle.update({
            where: { id: existingVehicle.id },
            data: vehicleData
          });
          console.log(`Updated vehicle ${vehicleData.name}`);
        } else {
          // Create new vehicle
          await prisma.vehicle.create({
            data: vehicleData
          });
          console.log(`Created vehicle ${vehicleData.name}`);
        }
      }
    } catch (error) {
      console.error(`Failed to create/update vehicle ${vehicleData.name}:`, error);
    }
  }

  console.log('Demo vehicles created successfully');
}


main();