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
    },
    {
      name: 'Impact Driver',
      description: '20V Max Lithium-Ion impact driver',
      category: 'Power Tools',
      brand: 'DeWalt',
      model: 'DCF887B',
      purchaseDate: new Date('2023-01-20'),
      purchasePrice: 149.99,
      location: 'Tool Cabinet A',
      notes: 'Three speed settings, LED light'
    },
    {
      name: 'Hammer',
      description: '16oz steel framing hammer with fiberglass handle',
      category: 'Hand Tools',
      brand: 'Estwing',
      model: 'E3-16S',
      purchaseDate: new Date('2023-02-05'),
      purchasePrice: 29.99,
      location: 'Tool Belt',
      notes: 'General purpose hammer'
    },
    {
      name: 'Level',
      description: '48-inch magnetic box level',
      category: 'Measuring Tools',
      brand: 'Johnson',
      model: '1717-4800',
      purchaseDate: new Date('2023-03-15'),
      purchasePrice: 32.99,
      location: 'Tool Cabinet B',
      notes: 'Aluminum frame, magnetic edge'
    },
    {
      name: 'Jigsaw',
      description: '20V cordless jigsaw with variable speed',
      category: 'Power Tools',
      brand: 'Milwaukee',
      model: 'M18 2737-20',
      purchaseDate: new Date('2023-04-10'),
      purchasePrice: 169.99,
      location: 'Tool Cabinet A',
      notes: 'Includes 5 blades and carrying case'
    },
    {
      name: 'Screwdriver Set',
      description: '12-piece precision screwdriver set',
      category: 'Hand Tools',
      brand: 'Klein Tools',
      model: '32614',
      purchaseDate: new Date('2023-05-05'),
      purchasePrice: 49.99,
      location: 'Tool Belt',
      notes: 'Phillips, flathead, and specialty tips'
    },
    {
      name: 'Reciprocating Saw',
      description: '15-Amp corded reciprocating saw',
      category: 'Power Tools',
      brand: 'Makita',
      model: 'JR3050T',
      purchaseDate: new Date('2023-06-01'),
      purchasePrice: 119.99,
      location: 'Tool Cabinet B',
      notes: 'For demolition work'
    },
    {
      name: 'Portable Air Compressor',
      description: '6-gallon pancake air compressor',
      category: 'Air Tools',
      brand: 'Porter-Cable',
      model: 'C2002',
      purchaseDate: new Date('2023-06-15'),
      purchasePrice: 149.99,
      location: 'Storage Room',
      notes: '150 PSI max, oil-free pump'
    },
    {
      name: 'Nail Gun',
      description: 'Pneumatic 15-gauge finish nailer',
      category: 'Air Tools',
      brand: 'Bostitch',
      model: 'N62FNK-2',
      purchaseDate: new Date('2023-07-01'),
      purchasePrice: 199.99,
      location: 'Tool Cabinet C',
      notes: 'Compatible with our air compressor'
    },
    {
      name: 'Angle Grinder',
      description: '4.5-inch angle grinder with paddle switch',
      category: 'Power Tools',
      brand: 'Bosch',
      model: 'GWS18V-45',
      purchaseDate: new Date('2023-07-15'),
      purchasePrice: 129.99,
      location: 'Tool Cabinet A',
      notes: 'Multiple grinding wheels available'
    },
    {
      name: 'Utility Knife',
      description: 'Retractable utility knife with blade storage',
      category: 'Hand Tools',
      brand: 'Stanley',
      model: '10-789',
      purchaseDate: new Date('2023-08-01'),
      purchasePrice: 9.99,
      location: 'Tool Belt',
      notes: 'Includes 5 extra blades'
    },
    {
      name: 'Ladder',
      description: '6-foot fiberglass step ladder',
      category: 'Access Equipment',
      brand: 'Werner',
      model: 'FS106',
      purchaseDate: new Date('2023-08-15'),
      purchasePrice: 79.99,
      location: 'Storage Room',
      notes: '250-pound capacity, Type I'
    },
    {
      name: 'Router',
      description: '2-1/4 HP variable speed router',
      category: 'Power Tools',
      brand: 'Bosch',
      model: '1617EVSPK',
      purchaseDate: new Date('2023-09-01'),
      purchasePrice: 189.99,
      location: 'Tool Cabinet C',
      notes: 'Includes fixed and plunge bases'
    },
    {
      name: 'Sander',
      description: '5-inch random orbit sander',
      category: 'Power Tools',
      brand: 'DeWalt',
      model: 'DWE6423K',
      purchaseDate: new Date('2023-09-15'),
      purchasePrice: 79.99,
      location: 'Tool Cabinet A',
      notes: 'Dust collection bag included'
    },
    {
      name: 'Shop Vacuum',
      description: '16-gallon wet/dry shop vacuum',
      category: 'Cleaning Equipment',
      brand: 'Ridgid',
      model: 'WD1851',
      purchaseDate: new Date('2023-10-01'),
      purchasePrice: 149.99,
      location: 'Storage Room',
      notes: 'Includes multiple attachments'
    },
    {
      name: 'Rotary Hammer Drill',
      description: 'SDS-Plus rotary hammer drill',
      category: 'Power Tools',
      brand: 'Hilti',
      model: 'TE 2-A22',
      purchaseDate: new Date('2023-10-15'),
      purchasePrice: 349.99,
      location: 'Tool Cabinet B',
      notes: 'For masonry and concrete drilling'
    },
    {
      name: 'Tile Cutter',
      description: '24-inch manual tile cutter',
      category: 'Specialty Tools',
      brand: 'QEP',
      model: '10630Q',
      purchaseDate: new Date('2023-11-01'),
      purchasePrice: 129.99,
      location: 'Tile Storage',
      notes: 'For ceramic and porcelain tiles'
    },
    {
      name: 'Pipe Wrench',
      description: '14-inch heavy-duty pipe wrench',
      category: 'Plumbing Tools',
      brand: 'Ridgid',
      model: '31030',
      purchaseDate: new Date('2023-11-15'),
      purchasePrice: 32.99,
      location: 'Plumbing Storage',
      notes: 'Cast iron construction'
    },
    {
      name: 'Miter Saw',
      description: '12-inch dual-bevel sliding compound miter saw',
      category: 'Power Tools',
      brand: 'DeWalt',
      model: 'DWS780',
      purchaseDate: new Date('2023-12-01'),
      purchasePrice: 599.99,
      location: 'Workshop',
      notes: 'With LED cutline system'
    },
    {
      name: 'Stud Finder',
      description: 'Electronic stud finder with LCD display',
      category: 'Measuring Tools',
      brand: 'Zircon',
      model: 'MetalliScanner m40',
      purchaseDate: new Date('2023-12-15'),
      purchasePrice: 39.99,
      location: 'Tool Cabinet B',
      notes: 'Detects wood and metal studs'
    },
    {
      name: 'Heat Gun',
      description: 'Dual temperature heat gun with accessories',
      category: 'Specialty Tools',
      brand: 'Wagner',
      model: 'HT1000',
      purchaseDate: new Date('2024-01-01'),
      purchasePrice: 29.99,
      location: 'Tool Cabinet C',
      notes: 'For paint removal and heat shrinking'
    },
    {
      name: 'Oscillating Multi-Tool',
      description: '20V cordless oscillating multi-tool',
      category: 'Power Tools',
      brand: 'Makita',
      model: 'XMT03Z',
      purchaseDate: new Date('2024-01-15'),
      purchasePrice: 119.99,
      location: 'Tool Cabinet A',
      notes: 'Various attachments included'
    },
    {
      name: 'Pliers Set',
      description: '5-piece pliers set with carrying pouch',
      category: 'Hand Tools',
      brand: 'Channellock',
      model: 'TOOLROLL-5',
      purchaseDate: new Date('2024-02-01'),
      purchasePrice: 89.99,
      location: 'Tool Cabinet B',
      notes: 'Includes needle nose, diagonal, and slip joint pliers'
    },
    {
      name: 'Laser Level',
      description: 'Self-leveling cross-line laser level',
      category: 'Measuring Tools',
      brand: 'Bosch',
      model: 'GLL 2-20',
      purchaseDate: new Date('2024-02-15'),
      purchasePrice: 149.99,
      location: 'Tool Cabinet A',
      notes: 'Horizontal and vertical lines'
    },
    {
      name: 'Table Saw',
      description: '10-inch portable table saw with stand',
      category: 'Power Tools',
      brand: 'DeWalt',
      model: 'DWE7491RS',
      purchaseDate: new Date('2024-03-01'),
      purchasePrice: 599.99,
      location: 'Workshop',
      notes: 'Rack and pinion fence system'
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
    {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '555-456-7890',
      address: '101 Maple Dr, Anytown, USA',
      billingAddress: '101 Maple Dr, Anytown, USA',
    },
    {
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      phone: '555-567-8901',
      address: '202 Cedar Ln, Somewhere, USA',
      billingAddress: '202 Cedar Ln, Somewhere, USA',
    },
    {
      name: 'Jennifer Martinez',
      email: 'jennifer.martinez@example.com',
      phone: '555-678-9012',
      address: '303 Birch St, Nowhere, USA',
      billingAddress: '303 Birch St, Nowhere, USA',
    },
    {
      name: 'Robert Taylor',
      email: 'robert.taylor@example.com',
      phone: '555-789-0123',
      address: '404 Walnut Ave, Anytown, USA',
      billingAddress: '404 Walnut Ave, Anytown, USA',
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      phone: '555-890-1234',
      address: '505 Spruce Rd, Somewhere, USA',
      billingAddress: '505 Spruce Rd, Somewhere, USA',
    },
    {
      name: 'James Thomas',
      email: 'james.thomas@example.com',
      phone: '555-901-2345',
      address: '606 Elm St, Nowhere, USA',
      billingAddress: '606 Elm St, Nowhere, USA',
    },
    {
      name: 'Patricia Jackson',
      email: 'patricia.jackson@example.com',
      phone: '555-012-3456',
      address: '707 Willow Dr, Anytown, USA',
      billingAddress: '707 Willow Dr, Anytown, USA',
    },
    {
      name: 'Richard White',
      email: 'richard.white@example.com',
      phone: '555-123-4567',
      address: '808 Hickory Ln, Somewhere, USA',
      billingAddress: '808 Hickory Ln, Somewhere, USA',
    },
    {
      name: 'Susan Harris',
      email: 'susan.harris@example.com',
      phone: '555-234-5678',
      address: '909 Cherry St, Nowhere, USA',
      billingAddress: '909 Cherry St, Nowhere, USA',
    },
    {
      name: 'Charles Clark',
      email: 'charles.clark@example.com',
      phone: '555-345-6789',
      address: '111 Aspen Dr, Anytown, USA',
      billingAddress: '111 Aspen Dr, Anytown, USA',
    },
    {
      name: 'Nancy Lewis',
      email: 'nancy.lewis@example.com',
      phone: '555-456-7890',
      address: '222 Poplar Ave, Somewhere, USA',
      billingAddress: '222 Poplar Ave, Somewhere, USA',
    },
    {
      name: 'Joseph Allen',
      email: 'joseph.allen@example.com',
      phone: '555-567-8901',
      address: '333 Cypress Rd, Nowhere, USA',
      billingAddress: '333 Cypress Rd, Nowhere, USA',
    },
    {
      name: 'Margaret Young',
      email: 'margaret.young@example.com',
      phone: '555-678-9012',
      address: '444 Sycamore St, Anytown, USA',
      billingAddress: '444 Sycamore St, Anytown, USA',
    },
    {
      name: 'Thomas Walker',
      email: 'thomas.walker@example.com',
      phone: '555-789-0123',
      address: '555 Redwood Ln, Somewhere, USA',
      billingAddress: '555 Redwood Ln, Somewhere, USA',
    },
    {
      name: 'Dorothy Hall',
      email: 'dorothy.hall@example.com',
      phone: '555-890-1234',
      address: '666 Magnolia Dr, Nowhere, USA',
      billingAddress: '666 Magnolia Dr, Nowhere, USA',
    },
    {
      name: 'Daniel Adams',
      email: 'daniel.adams@example.com',
      phone: '555-901-2345',
      address: '777 Juniper Rd, Anytown, USA',
      billingAddress: '777 Juniper Rd, Anytown, USA',
    },
    {
      name: 'Barbara Campbell',
      email: 'barbara.campbell@example.com',
      phone: '555-012-3456',
      address: '888 Hemlock St, Somewhere, USA',
      billingAddress: '888 Hemlock St, Somewhere, USA',
    },
    {
      name: 'Paul Mitchell',
      email: 'paul.mitchell@example.com',
      phone: '555-123-4567',
      address: '999 Fir Ave, Nowhere, USA',
      billingAddress: '999 Fir Ave, Nowhere, USA',
    },
    {
      name: 'Elizabeth Roberts',
      email: 'elizabeth.roberts@example.com',
      phone: '555-234-5678',
      address: '121 Larch Dr, Anytown, USA',
      billingAddress: '121 Larch Dr, Anytown, USA',
    },
    {
      name: 'Mark Turner',
      email: 'mark.turner@example.com',
      phone: '555-345-6789',
      address: '232 Beech Ln, Somewhere, USA',
      billingAddress: '232 Beech Ln, Somewhere, USA',
    },
    {
      name: 'Sandra Phillips',
      email: 'sandra.phillips@example.com',
      phone: '555-456-7890',
      address: '343 Locust St, Nowhere, USA',
      billingAddress: '343 Locust St, Nowhere, USA',
    },
    {
      name: 'Steven Evans',
      email: 'steven.evans@example.com',
      phone: '555-567-8901',
      address: '454 Ash Dr, Anytown, USA',
      billingAddress: '454 Ash Dr, Anytown, USA',
    },
    {
      name: 'Carol Edwards',
      email: 'carol.edwards@example.com',
      phone: '555-678-9012',
      address: '565 Dogwood Ave, Somewhere, USA',
      billingAddress: '565 Dogwood Ave, Somewhere, USA',
    },
    {
      name: 'George Collins',
      email: 'george.collins@example.com',
      phone: '555-789-0123',
      address: '676 Lilac Rd, Nowhere, USA',
      billingAddress: '676 Lilac Rd, Nowhere, USA',
    },
    {
      name: 'Ruth Stewart',
      email: 'ruth.stewart@example.com',
      phone: '555-890-1234',
      address: '787 Holly Dr, Anytown, USA',
      billingAddress: '787 Holly Dr, Anytown, USA',
    },
    {
      name: 'Kenneth Morris',
      email: 'kenneth.morris@example.com',
      phone: '555-901-2345',
      address: '898 Cedar Ln, Somewhere, USA',
      billingAddress: '898 Cedar Ln, Somewhere, USA',
    },
    {
      name: 'Helen Rogers',
      email: 'helen.rogers@example.com',
      phone: '555-012-3456',
      address: '919 Birch St, Nowhere, USA',
      billingAddress: '919 Birch St, Nowhere, USA',
    }
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
    },
    {
      name: 'Davis Master Bathroom Remodel',
      description: 'Luxury master bathroom with heated floors and walk-in shower',
      status: 'active',
      budget: 32000.00,
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-04-20'),
      customerName: 'Emily Davis'
    },
    {
      name: 'Wilson Garage Conversion',
      description: 'Converting garage into a home gym with custom storage',
      status: 'completed',
      budget: 18500.00,
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-02-28'),
      customerName: 'David Wilson'
    },
    {
      name: 'Martinez Outdoor Kitchen',
      description: 'Fully equipped outdoor kitchen with pizza oven and bar area',
      status: 'pending',
      budget: 29750.00,
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-07-30'),
      customerName: 'Jennifer Martinez'
    },
    {
      name: 'Taylor Home Office Addition',
      description: 'Adding a dedicated home office with custom built-ins',
      status: 'active',
      budget: 22000.00,
      startDate: new Date('2024-03-22'),
      endDate: new Date('2024-05-15'),
      customerName: 'Robert Taylor'
    },
    {
      name: 'Anderson Roof Replacement',
      description: 'Complete roof tear-off and replacement with high-end materials',
      status: 'active',
      budget: 27500.00,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-05-01'),
      customerName: 'Lisa Anderson'
    },
    {
      name: 'Thomas Pool Installation',
      description: 'In-ground pool with custom patio and landscaping',
      status: 'pending',
      budget: 65000.00,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-15'),
      customerName: 'James Thomas'
    },
    {
      name: 'Jackson Front Porch Addition',
      description: 'Adding a covered front porch with custom railings',
      status: 'completed',
      budget: 18500.00,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-01'),
      customerName: 'Patricia Jackson'
    },
    {
      name: 'White Sunroom Addition',
      description: 'Adding a four-season sunroom with energy efficient windows',
      status: 'active',
      budget: 38000.00,
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-06-01'),
      customerName: 'Richard White'
    },
    {
      name: 'Harris Deck Rebuild',
      description: 'Replacing old deck with composite decking and custom lighting',
      status: 'on_hold',
      budget: 24000.00,
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-06-01'),
      customerName: 'Susan Harris'
    },
    {
      name: 'Clark Kitchen Extension',
      description: 'Expanding kitchen with additional cabinets and island',
      status: 'active',
      budget: 42000.00,
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-05-30'),
      customerName: 'Charles Clark'
    },
    {
      name: 'Lewis Basement Waterproofing',
      description: 'Full basement waterproofing and drainage system installation',
      status: 'completed',
      budget: 16000.00,
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-03-15'),
      customerName: 'Nancy Lewis'
    },
    {
      name: 'Allen Home Theatre Setup',
      description: 'Dedicated home theatre room with custom lighting and sound',
      status: 'active',
      budget: 35000.00,
      startDate: new Date('2024-03-20'),
      endDate: new Date('2024-05-30'),
      customerName: 'Joseph Allen'
    },
    {
      name: 'Young Window Replacement',
      description: 'Replacing all windows with energy efficient models',
      status: 'active',
      budget: 28000.00,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-05-15'),
      customerName: 'Margaret Young'
    },
    {
      name: 'Walker Bathroom Expansion',
      description: 'Converting half bath to full bath with custom tile work',
      status: 'pending',
      budget: 22500.00,
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-07-01'),
      customerName: 'Thomas Walker'
    },
    {
      name: 'Hall Laundry Room Remodel',
      description: 'Modernizing laundry room with custom cabinets and new fixtures',
      status: 'active',
      budget: 12500.00,
      startDate: new Date('2024-04-10'),
      endDate: new Date('2024-05-15'),
      customerName: 'Dorothy Hall'
    },
    {
      name: 'Adams Smart Home Installation',
      description: 'Complete smart home system with lighting, security, and HVAC',
      status: 'active',
      budget: 42000.00,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-04-30'),
      customerName: 'Daniel Adams'
    },
    {
      name: 'Campbell Attic Conversion',
      description: 'Converting attic into extra bedroom with private bathroom',
      status: 'pending',
      budget: 45000.00,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-15'),
      customerName: 'Barbara Campbell'
    },
    {
      name: 'Mitchell Eco-Friendly Upgrade',
      description: 'Installing solar panels and energy efficient systems',
      status: 'active',
      budget: 52000.00,
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-06-30'),
      customerName: 'Paul Mitchell'
    },
    {
      name: 'Roberts Exterior Painting',
      description: 'Complete exterior painting with premium materials',
      status: 'completed',
      budget: 14500.00,
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-04-15'),
      customerName: 'Elizabeth Roberts'
    },
    {
      name: 'Turner Driveway Expansion',
      description: 'Expanding and repaving driveway with decorative borders',
      status: 'pending',
      budget: 16000.00,
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-06-15'),
      customerName: 'Mark Turner'
    },
    {
      name: 'Phillips Flooring Upgrade',
      description: 'Installing hardwood flooring throughout first floor',
      status: 'active',
      budget: 32000.00,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-05-30'),
      customerName: 'Sandra Phillips'
    },
    {
      name: 'Evans Outdoor Living Space',
      description: 'Creating covered outdoor living area with fireplace',
      status: 'active',
      budget: 38000.00,
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-06-01'),
      customerName: 'Steven Evans'
    },
    {
      name: 'Edwards Mudroom Addition',
      description: 'Adding custom mudroom with storage solutions',
      status: 'on_hold',
      budget: 18500.00,
      startDate: new Date('2024-04-20'),
      endDate: new Date('2024-06-10'),
      customerName: 'Carol Edwards'
    },
    {
      name: 'Collins Nursery Renovation',
      description: 'Converting spare room into nursery with custom details',
      status: 'active',
      budget: 14000.00,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-05-15'),
      customerName: 'George Collins'
    },
    {
      name: 'Stewart Garden Landscaping',
      description: 'Complete garden redesign with irrigation system',
      status: 'pending',
      budget: 28500.00,
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-07-30'),
      customerName: 'Ruth Stewart'
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
    },
    // Additional invoices to reach 30 total
    {
      invoiceNumber: "INV-2024-006",
      issueDate: new Date('2024-03-10'),
      dueDate: new Date('2024-04-10'),
      status: "paid",
      totalAmount: 5200.00,
      taxRate: 0.07,
      taxAmount: 364.00,
      notes: "Electrical work for Davis Master Bathroom",
      customerName: "Emily Davis",
      projectNames: ["Davis Master Bathroom Remodel"]
    },
    {
      invoiceNumber: "INV-2024-007",
      issueDate: new Date('2024-02-05'),
      dueDate: new Date('2024-03-05'),
      status: "paid",
      totalAmount: 18500.00,
      taxRate: 0.07,
      taxAmount: 1295.00,
      notes: "Final payment for Wilson Garage Conversion",
      customerName: "David Wilson",
      projectNames: ["Wilson Garage Conversion"]
    },
    {
      invoiceNumber: "INV-2024-008",
      issueDate: new Date('2024-02-25'),
      dueDate: new Date('2024-03-25'),
      status: "overdue",
      totalAmount: 7500.00,
      taxRate: 0.07,
      taxAmount: 525.00,
      notes: "Custom shelving installation",
      customerName: "Robert Taylor",
      projectNames: ["Taylor Home Office Addition"]
    },
    {
      invoiceNumber: "INV-2024-009",
      issueDate: new Date('2024-03-15'),
      dueDate: new Date('2024-04-15'),
      status: "sent",
      totalAmount: 12750.00,
      taxRate: 0.07,
      taxAmount: 892.50,
      notes: "Initial roof replacement costs",
      customerName: "Lisa Anderson",
      projectNames: ["Anderson Roof Replacement"]
    },
    {
      invoiceNumber: "INV-2024-010",
      issueDate: new Date('2024-01-20'),
      dueDate: new Date('2024-02-20'),
      status: "paid",
      totalAmount: 9200.00,
      taxRate: 0.07,
      taxAmount: 644.00,
      notes: "Completion of front porch addition",
      customerName: "Patricia Jackson",
      projectNames: ["Jackson Front Porch Addition"]
    },
    {
      invoiceNumber: "INV-2024-011",
      issueDate: new Date('2024-03-25'),
      dueDate: new Date('2024-04-25'),
      status: "sent",
      totalAmount: 15000.00,
      taxRate: 0.07,
      taxAmount: 1050.00,
      notes: "Progress payment for White Sunroom Addition",
      customerName: "Richard White",
      projectNames: ["White Sunroom Addition"]
    },
    {
      invoiceNumber: "INV-2024-012",
      issueDate: new Date('2024-02-18'),
      dueDate: new Date('2024-03-18'),
      status: "paid",
      totalAmount: 16000.00,
      taxRate: 0.07,
      taxAmount: 1120.00,
      notes: "Full payment for basement waterproofing",
      customerName: "Nancy Lewis",
      projectNames: ["Lewis Basement Waterproofing"]
    },
    {
      invoiceNumber: "INV-2024-013",
      issueDate: new Date('2024-03-30'),
      dueDate: new Date('2024-04-30'),
      status: "sent",
      totalAmount: 11500.00,
      taxRate: 0.07,
      taxAmount: 805.00,
      notes: "Home theatre equipment and installation",
      customerName: "Joseph Allen",
      projectNames: ["Allen Home Theatre Setup"]
    },
    {
      invoiceNumber: "INV-2024-014",
      issueDate: new Date('2024-04-05'),
      dueDate: new Date('2024-05-05'),
      status: "draft",
      totalAmount: 14000.00,
      taxRate: 0.07,
      taxAmount: 980.00,
      notes: "Window replacement first floor",
      customerName: "Margaret Young",
      projectNames: ["Young Window Replacement"]
    },
    {
      invoiceNumber: "INV-2024-015",
      issueDate: new Date('2024-04-12'),
      dueDate: new Date('2024-05-12'),
      status: "draft",
      totalAmount: 6250.00,
      taxRate: 0.07,
      taxAmount: 437.50,
      notes: "Laundry room fixtures and cabinetry",
      customerName: "Dorothy Hall",
      projectNames: ["Hall Laundry Room Remodel"]
    },
    {
      invoiceNumber: "INV-2024-016",
      issueDate: new Date('2024-03-08'),
      dueDate: new Date('2024-04-08'),
      status: "paid",
      totalAmount: 18000.00,
      taxRate: 0.07,
      taxAmount: 1260.00,
      notes: "Smart home system initial installation",
      customerName: "Daniel Adams",
      projectNames: ["Adams Smart Home Installation"]
    },
    {
      invoiceNumber: "INV-2024-017",
      issueDate: new Date('2024-03-12'),
      dueDate: new Date('2024-04-12'),
      status: "paid",
      totalAmount: 14500.00,
      taxRate: 0.07,
      taxAmount: 1015.00,
      notes: "Complete exterior painting services",
      customerName: "Elizabeth Roberts",
      projectNames: ["Roberts Exterior Painting"]
    },
    {
      invoiceNumber: "INV-2024-018",
      issueDate: new Date('2024-04-08'),
      dueDate: new Date('2024-05-08'),
      status: "draft",
      totalAmount: 12800.00,
      taxRate: 0.07,
      taxAmount: 896.00,
      notes: "Hardwood flooring materials",
      customerName: "Sandra Phillips",
      projectNames: ["Phillips Flooring Upgrade"]
    },
    {
      invoiceNumber: "INV-2024-019",
      issueDate: new Date('2024-03-22'),
      dueDate: new Date('2024-04-22'),
      status: "sent",
      totalAmount: 15200.00,
      taxRate: 0.07,
      taxAmount: 1064.00,
      notes: "Outdoor living area foundation and framing",
      customerName: "Steven Evans",
      projectNames: ["Evans Outdoor Living Space"]
    },
    {
      invoiceNumber: "INV-2024-020",
      issueDate: new Date('2024-04-02'),
      dueDate: new Date('2024-05-02'),
      status: "draft",
      totalAmount: 7000.00,
      taxRate: 0.07,
      taxAmount: 490.00,
      notes: "Nursery renovation materials and labor",
      customerName: "George Collins",
      projectNames: ["Collins Nursery Renovation"]
    },
    {
      invoiceNumber: "INV-2024-021",
      issueDate: new Date('2024-02-10'),
      dueDate: new Date('2024-03-10'),
      status: "paid",
      totalAmount: 8500.00,
      taxRate: 0.07,
      taxAmount: 595.00,
      notes: "Kitchen renovation materials",
      customerName: "Michael Brown",
      projectNames: ["Brown Kitchen Upgrade"]
    },
    {
      invoiceNumber: "INV-2024-022",
      issueDate: new Date('2024-03-18'),
      dueDate: new Date('2024-04-18'),
      status: "overdue",
      totalAmount: 6800.00,
      taxRate: 0.07,
      taxAmount: 476.00,
      notes: "Custom door installation labor",
      customerName: "John Smith",
      projectNames: ["Smith Residence Renovation"]
    },
    {
      invoiceNumber: "INV-2024-023",
      issueDate: new Date('2024-03-20'),
      dueDate: new Date('2024-04-20'),
      status: "sent",
      totalAmount: 9500.00,
      taxRate: 0.07,
      taxAmount: 665.00,
      notes: "Bathroom fixtures and tile work",
      customerName: "Sarah Johnson",
      projectNames: ["Johnson House Remodel"]
    },
    {
      invoiceNumber: "INV-2024-024",
      issueDate: new Date('2024-01-25'),
      dueDate: new Date('2024-02-25'),
      status: "paid",
      totalAmount: 4200.00,
      taxRate: 0.07,
      taxAmount: 294.00,
      notes: "Custom shelving materials and labor",
      customerName: "Sarah Johnson",
      projectNames: ["Johnson Basement Conversion"]
    },
    {
      invoiceNumber: "INV-2024-025",
      issueDate: new Date('2024-02-28'),
      dueDate: new Date('2024-03-28'),
      status: "paid",
      totalAmount: 2800.00,
      taxRate: 0.07,
      taxAmount: 196.00,
      notes: "Tile backsplash installation",
      customerName: "Michael Brown",
      projectNames: ["Brown Kitchen Upgrade"]
    },
    {
      invoiceNumber: "INV-2024-026",
      issueDate: new Date('2024-04-15'),
      dueDate: new Date('2024-05-15'),
      status: "draft",
      totalAmount: 22000.00,
      taxRate: 0.07,
      taxAmount: 1540.00,
      notes: "Final payment for window replacement",
      customerName: "Margaret Young",
      projectNames: ["Young Window Replacement"]
    },
    {
      invoiceNumber: "INV-2024-027",
      issueDate: new Date('2024-04-18'),
      dueDate: new Date('2024-05-18'),
      status: "draft",
      totalAmount: 24000.00,
      taxRate: 0.07,
      taxAmount: 1680.00,
      notes: "Final payment for smart home installation",
      customerName: "Daniel Adams",
      projectNames: ["Adams Smart Home Installation"]
    },
    {
      invoiceNumber: "INV-2024-028",
      issueDate: new Date('2024-03-28'),
      dueDate: new Date('2024-04-28'),
      status: "overdue",
      totalAmount: 5000.00,
      taxRate: 0.07,
      taxAmount: 350.00,
      notes: "Electrical panel upgrade",
      customerName: "John Smith",
      projectNames: ["Smith Residence Renovation"]
    },
    {
      invoiceNumber: "INV-2024-029",
      issueDate: new Date('2024-04-22'),
      dueDate: new Date('2024-05-22'),
      status: "draft",
      totalAmount: 22800.00,
      taxRate: 0.07,
      taxAmount: 1596.00,
      notes: "Final payment for outdoor living space",
      customerName: "Steven Evans",
      projectNames: ["Evans Outdoor Living Space"]
    },
    {
      invoiceNumber: "INV-2024-030",
      issueDate: new Date('2024-04-25'),
      dueDate: new Date('2024-05-25'),
      status: "draft",
      totalAmount: 19200.00,
      taxRate: 0.07,
      taxAmount: 1344.00,
      notes: "Final payment for hardwood flooring",
      customerName: "Sandra Phillips",
      projectNames: ["Phillips Flooring Upgrade"]
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
      let projectId: number | undefined = undefined;
      if (job.projectName) {
        const foundProjectId = projectIds[job.projectName];
        if (foundProjectId) {
          projectId = foundProjectId;
        } else {
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
    },
    {
      name: 'Crew Transport Van',
      make: 'Ford',
      model: 'Transit',
      year: 2022,
      licensePlate: 'CREW-001',
      vin: 'VAN123CREW456789H6',
      color: 'White',
      type: 'van',
      status: 'active',
      purchaseDate: new Date('2022-03-15'),
      purchasePrice: 42000,
      mileage: 18500,
      fuelType: 'gasoline',
      notes: 'For transporting work crews to job sites'
    },
    {
      name: 'Utility Pickup',
      make: 'Ram',
      model: '1500',
      year: 2021,
      licensePlate: 'UTIL-123',
      vin: 'RAM123UTIL456789H7',
      color: 'Red',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2021-05-20'),
      purchasePrice: 39500,
      mileage: 27300,
      fuelType: 'gasoline',
      notes: 'General purpose utility truck'
    },
    {
      name: 'Heavy Duty Hauler',
      make: 'Ford',
      model: 'F-350',
      year: 2020,
      licensePlate: 'HEAVY-01',
      vin: 'FORD350HD456789H8',
      color: 'Blue',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2020-07-10'),
      purchasePrice: 58000,
      mileage: 42000,
      fuelType: 'diesel',
      notes: 'For heavy equipment and material transport'
    },
    {
      name: 'Project Manager SUV',
      make: 'Jeep',
      model: 'Grand Cherokee',
      year: 2022,
      licensePlate: 'MGR-5678',
      vin: 'JEEP123SUV456789H9',
      color: 'Black',
      type: 'suv',
      status: 'active',
      purchaseDate: new Date('2022-04-25'),
      purchasePrice: 45000,
      mileage: 15600,
      fuelType: 'gasoline',
      notes: 'For project managers to visit multiple sites'
    },
    {
      name: 'Excavation Support Truck',
      make: 'Chevrolet',
      model: 'Colorado',
      year: 2021,
      licensePlate: 'EXCV-222',
      vin: 'CHEVY123COL56789I1',
      color: 'Gray',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2021-08-15'),
      purchasePrice: 36500,
      mileage: 22000,
      fuelType: 'gasoline',
      notes: 'For supporting excavation projects'
    },
    {
      name: 'Executive Vehicle',
      make: 'Audi',
      model: 'Q7',
      year: 2023,
      licensePlate: 'EXEC-007',
      vin: 'AUDI123Q7X456789I2',
      color: 'Black',
      type: 'suv',
      status: 'active',
      purchaseDate: new Date('2023-01-10'),
      purchasePrice: 65000,
      mileage: 8500,
      fuelType: 'gasoline',
      notes: 'For executive transportation and client meetings'
    },
    {
      name: 'Small Equipment Truck',
      make: 'Toyota',
      model: 'Tundra',
      year: 2022,
      licensePlate: 'EQUIP-12',
      vin: 'TOYOTA123TUN6789I3',
      color: 'Silver',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2022-05-05'),
      purchasePrice: 43000,
      mileage: 16800,
      fuelType: 'gasoline',
      notes: 'For transporting small equipment to job sites'
    },
    {
      name: 'Electric Service Vehicle',
      make: 'Rivian',
      model: 'R1T',
      year: 2023,
      licensePlate: 'ELEC-123',
      vin: 'RIVIAN123RT456789I4',
      color: 'Blue',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2023-04-18'),
      purchasePrice: 73000,
      mileage: 5600,
      fuelType: 'electric',
      notes: 'Electric pickup for local service calls'
    },
    {
      name: 'Compact Utility Van',
      make: 'Nissan',
      model: 'NV200',
      year: 2021,
      licensePlate: 'CVAN-456',
      vin: 'NISSAN123NV456789I5',
      color: 'White',
      type: 'van',
      status: 'maintenance',
      purchaseDate: new Date('2021-03-22'),
      purchasePrice: 28500,
      mileage: 31200,
      fuelType: 'gasoline',
      notes: 'For service calls requiring tools and small parts'
    },
    {
      name: 'Trailer Towing Truck',
      make: 'GMC',
      model: 'Sierra 2500',
      year: 2021,
      licensePlate: 'TOW-789',
      vin: 'GMC123SIE2456789I6',
      color: 'Dark Red',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2021-09-10'),
      purchasePrice: 54000,
      mileage: 19800,
      fuelType: 'diesel',
      notes: 'Configured for heavy trailer towing'
    },
    {
      name: 'Emergency Response Vehicle',
      make: 'Ford',
      model: 'Ranger',
      year: 2022,
      licensePlate: 'EMER-911',
      vin: 'FORD123RNG456789I7',
      color: 'Yellow',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2022-02-15'),
      purchasePrice: 32000,
      mileage: 14500,
      fuelType: 'gasoline',
      notes: 'Equipped for emergency site responses'
    },
    {
      name: 'Hybrid Field SUV',
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      year: 2023,
      licensePlate: 'HYBD-345',
      vin: 'TOYOTA123RV456789I8',
      color: 'Green',
      type: 'suv',
      status: 'active',
      purchaseDate: new Date('2023-03-12'),
      purchasePrice: 38500,
      mileage: 9200,
      fuelType: 'hybrid',
      notes: 'Fuel-efficient vehicle for field supervisors'
    },
    {
      name: 'Client Transport Vehicle',
      make: 'Honda',
      model: 'Pilot',
      year: 2022,
      licensePlate: 'CLNT-123',
      vin: 'HONDA123PLT56789I9',
      color: 'Blue',
      type: 'suv',
      status: 'active',
      purchaseDate: new Date('2022-06-20'),
      purchasePrice: 41000,
      mileage: 12800,
      fuelType: 'gasoline',
      notes: 'For client site visits and presentations'
    },
    {
      name: 'Winter Service Truck',
      make: 'Chevrolet',
      model: 'Silverado 1500',
      year: 2021,
      licensePlate: 'SNOW-444',
      vin: 'CHEVY123SLV56789J1',
      color: 'White',
      type: 'truck',
      status: 'retired',
      purchaseDate: new Date('2021-10-05'),
      purchasePrice: 42500,
      mileage: 28600,
      fuelType: 'gasoline',
      notes: 'Equipped with snowplow and salt spreader'
    },
    {
      name: 'City Service Compact',
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      licensePlate: 'CITY-987',
      vin: 'HONDA123CVC56789J2',
      color: 'Silver',
      type: 'car',
      status: 'active',
      purchaseDate: new Date('2022-04-08'),
      purchasePrice: 24500,
      mileage: 18900,
      fuelType: 'gasoline',
      notes: 'Economical vehicle for urban service calls'
    },
    {
      name: 'Long Haul Transport Truck',
      make: 'Ram',
      model: '3500',
      year: 2020,
      licensePlate: 'LONG-777',
      vin: 'RAM12335056789J3',
      color: 'Black',
      type: 'truck',
      status: 'maintenance',
      purchaseDate: new Date('2020-08-15'),
      purchasePrice: 62000,
      mileage: 52000,
      fuelType: 'diesel',
      notes: 'For long-distance material transport'
    },
    {
      name: 'Electrical Service Van',
      make: 'Ford',
      model: 'E-Transit',
      year: 2023,
      licensePlate: 'ELEC-456',
      vin: 'FORDE123TST56789J4',
      color: 'White',
      type: 'van',
      status: 'active',
      purchaseDate: new Date('2023-05-22'),
      purchasePrice: 58000,
      mileage: 6200,
      fuelType: 'electric',
      notes: 'Electric van for electrical service work'
    },
    {
      name: 'Plumbing Service Van',
      make: 'RAM',
      model: 'ProMaster',
      year: 2022,
      licensePlate: 'PLUM-123',
      vin: 'RAM123PRO56789J5',
      color: 'Blue',
      type: 'van',
      status: 'active',
      purchaseDate: new Date('2022-03-18'),
      purchasePrice: 38500,
      mileage: 21400,
      fuelType: 'gasoline',
      notes: 'Configured for plumbing service work'
    },
    {
      name: 'Off-Road Site Inspection',
      make: 'Jeep',
      model: 'Wrangler',
      year: 2022,
      licensePlate: 'OFFRD-99',
      vin: 'JEEP123WRG56789J6',
      color: 'Green',
      type: 'suv',
      status: 'active',
      purchaseDate: new Date('2022-07-12'),
      purchasePrice: 45000,
      mileage: 14800,
      fuelType: 'gasoline',
      notes: 'For accessing difficult terrain job sites'
    },
    {
      name: 'Small Parts Delivery',
      make: 'Ford',
      model: 'Transit Connect',
      year: 2022,
      licensePlate: 'PART-555',
      vin: 'FORDTC123CON5678J7',
      color: 'White',
      type: 'van',
      status: 'active',
      purchaseDate: new Date('2022-02-28'),
      purchasePrice: 32000,
      mileage: 24600,
      fuelType: 'gasoline',
      notes: 'For delivering small parts to job sites'
    },
    {
      name: 'Multi-Tool Transport Truck',
      make: 'Nissan',
      model: 'Titan',
      year: 2021,
      licensePlate: 'TOOL-888',
      vin: 'NISSAN123TI56789J8',
      color: 'Gray',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2021-08-25'),
      purchasePrice: 41500,
      mileage: 32100,
      fuelType: 'gasoline',
      notes: 'Specially configured for tool transport'
    },
    {
      name: 'Landscaping Support Truck',
      make: 'Toyota',
      model: 'Tundra',
      year: 2021,
      licensePlate: 'LAND-234',
      vin: 'TOYOTA123TUN678J9',
      color: 'Green',
      type: 'truck',
      status: 'active',
      purchaseDate: new Date('2021-04-15'),
      purchasePrice: 39000,
      mileage: 29800,
      fuelType: 'gasoline',
      notes: 'Supports landscaping projects'
    },
    {
      name: 'Old Service Vehicle',
      make: 'Chevrolet',
      model: 'C/K 1500',
      year: 2010,
      licensePlate: 'OLD-1234',
      vin: 'CHEVY123CK156789K1',
      color: 'Faded Blue',
      type: 'truck',
      status: 'retired',
      purchaseDate: new Date('2010-06-15'),
      purchasePrice: 28000,
      mileage: 198000,
      fuelType: 'gasoline',
      notes: 'Retired service vehicle kept for backup'
    },
    {
      name: 'Administration Car',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      licensePlate: 'ADMIN-01',
      vin: 'TOYOTA123CM56789K2',
      color: 'Silver',
      type: 'car',
      status: 'active',
      purchaseDate: new Date('2022-01-05'),
      purchasePrice: 28500,
      mileage: 15400,
      fuelType: 'gasoline',
      notes: 'For administrative staff use'
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
        } else {
          // Create new vehicle
          await prisma.vehicle.create({
            data: vehicleData
          });
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
        } else {
          // Create new vehicle
          await prisma.vehicle.create({
            data: vehicleData
          });
        }
      }
    } catch (error) {
      console.error(`Failed to create/update vehicle ${vehicleData.name}:`, error);
    }
  }

  console.log('Demo vehicles created successfully');

  // Create demo templates
  const templates = [
    {
      type: 'invoice',
      title: 'Standard Invoice',
      description: 'Default professional invoice template',
      body: '<h1>INVOICE</h1><p>{{companyName}}</p><p>Invoice #: {{invoiceNumber}}</p><p>Date: {{date}}</p><table><tr><th>Description</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr>{{#items}}<tr><td>{{description}}</td><td>{{quantity}}</td><td>${{rate}}</td><td>${{amount}}</td></tr>{{/items}}</table><p>Subtotal: ${{subtotal}}</p><p>Tax ({{taxRate}}%): ${{taxAmount}}</p><p>Total: ${{total}}</p>',
      isDefault: true
    },
    {
      type: 'invoice',
      title: 'Detailed Invoice',
      description: 'Invoice with detailed line items and notes',
      body: '<div class="invoice-header"><h1>INVOICE</h1><div class="company-details"><p>{{companyName}}</p><p>{{companyAddress}}</p><p>{{companyPhone}}</p></div><div class="invoice-info"><p>Invoice #: {{invoiceNumber}}</p><p>Date: {{date}}</p><p>Due Date: {{dueDate}}</p></div></div><div class="customer-details"><h2>Billed To:</h2><p>{{customerName}}</p><p>{{customerAddress}}</p></div><table class="items-table"><tr><th>Item</th><th>Description</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr>{{#items}}<tr><td>{{name}}</td><td>{{description}}</td><td>{{quantity}}</td><td>${{rate}}</td><td>${{amount}}</td></tr>{{/items}}</table><div class="totals"><p>Subtotal: ${{subtotal}}</p><p>Tax ({{taxRate}}%): ${{taxAmount}}</p><p>Total: ${{total}}</p></div><div class="notes"><h3>Notes:</h3><p>{{notes}}</p></div><div class="footer"><p>Thank you for your business!</p></div>',
      isDefault: false
    },
    {
      type: 'invoice',
      title: 'Minimal Invoice',
      description: 'Clean, minimal invoice design',
      body: '<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;"><h2 style="color: #333;">Invoice #{{invoiceNumber}}</h2><div style="display: flex; justify-content: space-between;"><div><p>{{companyName}}<br>{{companyAddress}}</p></div><div><p>Date: {{date}}<br>Due: {{dueDate}}</p></div></div><div style="margin: 20px 0;"><h3>Billed To:</h3><p>{{customerName}}<br>{{customerAddress}}</p></div><table style="width: 100%; border-collapse: collapse;"><tr style="background-color: #f2f2f2;"><th style="padding: 10px; text-align: left;">Description</th><th style="padding: 10px; text-align: right;">Amount</th></tr>{{#items}}<tr><td style="padding: 10px; border-bottom: 1px solid #ddd;">{{description}}</td><td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${{amount}}</td></tr>{{/items}}</table><div style="text-align: right; margin-top: 20px;"><p>Total: ${{total}}</p></div></div>',
      isDefault: false
    },
    {
      type: 'proposal',
      title: 'Standard Proposal',
      description: 'Professional project proposal template',
      body: '<div class="proposal"><h1>PROJECT PROPOSAL</h1><div class="header"><p>Prepared for: {{clientName}}</p><p>Project: {{projectName}}</p><p>Date: {{date}}</p></div><div class="intro"><h2>Introduction</h2><p>{{introText}}</p></div><div class="scope"><h2>Scope of Work</h2><ul>{{#scopeItems}}<li>{{.}}</li>{{/scopeItems}}</ul></div><div class="timeline"><h2>Project Timeline</h2><p>Start Date: {{startDate}}</p><p>Completion Date: {{endDate}}</p><h3>Milestones:</h3><ul>{{#milestones}}<li>{{name}}: {{date}}</li>{{/milestones}}</ul></div><div class="cost"><h2>Cost Estimate</h2><table><tr><th>Item</th><th>Description</th><th>Cost</th></tr>{{#costItems}}<tr><td>{{item}}</td><td>{{description}}</td><td>${{cost}}</td></tr>{{/costItems}}</table><p>Total: ${{totalCost}}</p></div><div class="terms"><h2>Terms & Conditions</h2><p>{{termsText}}</p></div><div class="signature"><h2>Agreement</h2><p>{{clientName}} agrees to the proposal as outlined above.</p><div class="sign-line">Signature: ____________________</div><div class="sign-line">Date: ____________________</div></div></div>',
      isDefault: true
    },
    {
      type: 'proposal',
      title: 'Detailed Proposal',
      description: 'Comprehensive proposal with detailed sections',
      body: '<div class="proposal-container"><div class="company-header"><img src="{{companyLogo}}" alt="Company Logo"><h1>{{companyName}}</h1><p>{{companyAddress}}</p><p>{{companyPhone}} | {{companyEmail}}</p></div><div class="proposal-header"><h1>PROJECT PROPOSAL</h1><p>Reference: {{proposalNumber}}</p><p>Date: {{date}}</p></div><div class="client-info"><h2>Prepared For:</h2><p>{{clientName}}</p><p>{{clientCompany}}</p><p>{{clientAddress}}</p><p>{{clientEmail}}</p></div><div class="project-overview"><h2>Project: {{projectName}}</h2><p>{{projectSummary}}</p></div><div class="scope-section"><h2>Scope of Work</h2><p>{{scopeIntro}}</p><h3>Included:</h3><ul>{{#included}}<li>{{.}}</li>{{/included}}</ul><h3>Excluded:</h3><ul>{{#excluded}}<li>{{.}}</li>{{/excluded}}</ul></div><div class="approach-section"><h2>Our Approach</h2><p>{{approachText}}</p><div class="phases">{{#phases}}<div class="phase"><h3>Phase {{number}}: {{name}}</h3><p>{{description}}</p><ul>{{#tasks}}<li>{{.}}</li>{{/tasks}}</ul></div>{{/phases}}</div></div><div class="timeline-section"><h2>Project Timeline</h2><p>Estimated Start: {{startDate}}</p><p>Estimated Completion: {{endDate}}</p><div class="milestones"><h3>Key Milestones:</h3><table>{{#milestones}}<tr><td>{{name}}</td><td>{{date}}</td></tr>{{/milestones}}</table></div></div><div class="pricing-section"><h2>Pricing</h2>{{pricingIntro}}<table class="pricing-table"><tr><th>Item</th><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>{{#lineItems}}<tr><td>{{item}}</td><td>{{description}}</td><td>{{quantity}}</td><td>${{unitPrice}}</td><td>${{itemTotal}}</td></tr>{{/lineItems}}</table><div class="pricing-summary"><p>Subtotal: ${{subtotal}}</p><p>Tax ({{taxRate}}%): ${{taxAmount}}</p><p>Total: ${{total}}</p></div><p>{{paymentTerms}}</p></div><div class="terms-section"><h2>Terms & Conditions</h2><p>{{termsText}}</p></div><div class="closing-section"><h2>Next Steps</h2><p>{{nextSteps}}</p><div class="signature-area"><div class="sign-block"><p>ACCEPTED BY CLIENT:</p><p>Signature: _________________________</p><p>Name: _________________________</p><p>Date: _________________________</p></div><div class="sign-block"><p>APPROVED BY COMPANY:</p><p>Signature: _________________________</p><p>Name: _________________________</p><p>Date: _________________________</p></div></div></div></div>',
      isDefault: false
    },
    {
      type: 'contract',
      title: 'Standard Contract',
      description: 'Simple but comprehensive contract template',
      body: '<div class="contract"><h1>SERVICE CONTRACT</h1><p>This Contract is entered into on {{contractDate}} by and between:</p><p><strong>{{companyName}}</strong> (hereinafter referred to as "Contractor") and</p><p><strong>{{clientName}}</strong> (hereinafter referred to as "Client").</p><h2>1. Scope of Work</h2><p>{{scopeDescription}}</p><h2>2. Project Timeline</h2><p>Start Date: {{startDate}}</p><p>Completion Date: {{endDate}}</p><h2>3. Payment Terms</h2><p>Total Contract Value: ${{contractValue}}</p><p>Payment Schedule:</p><ul>{{#payments}}<li>{{amount}} - {{dueDate}} - {{description}}</li>{{/payments}}</ul><h2>4. Change Orders</h2><p>{{changeOrderTerms}}</p><h2>5. Termination</h2><p>{{terminationTerms}}</p><h2>6. Warranties</h2><p>{{warrantyTerms}}</p><h2>7. General Provisions</h2><p>{{generalProvisions}}</p><div class="signatures"><div class="signature-block"><p>CONTRACTOR:</p><p>{{companyName}}</p><p>Signature: _________________________</p><p>Name: {{companyRepName}}</p><p>Title: {{companyRepTitle}}</p><p>Date: _________________________</p></div><div class="signature-block"><p>CLIENT:</p><p>{{clientName}}</p><p>Signature: _________________________</p><p>Name: {{clientRepName}}</p><p>Title: {{clientRepTitle}}</p><p>Date: _________________________</p></div></div></div>',
      isDefault: true
    },
    {
      type: 'contract',
      title: 'Detailed Service Contract',
      description: 'Comprehensive service contract with detailed terms',
      body: `<div class="contract-document"><h1>PROFESSIONAL SERVICES AGREEMENT</h1><div class="date-section"><p>This Professional Services Agreement (the "Agreement") is made effective as of {{effectiveDate}} (the "Effective Date") by and between:</p></div><div class="parties-section"><p><strong>{{companyName}}</strong>, a [legal structure] with its principal place of business at {{companyAddress}} ("Contractor")</p><p>and</p><p><strong>{{clientName}}</strong>, a [legal structure] with its principal place of business at {{clientAddress}} ("Client").</p></div><div class="recitals-section"><p>WHEREAS, Contractor is in the business of providing {{serviceType}} services;</p><p>WHEREAS, Client desires to engage Contractor to provide certain services as set forth in this Agreement;</p><p>NOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained, the parties agree as follows:</p></div><h2>1. SERVICES</h2><p>1.1 Scope of Services. Contractor shall provide to Client the services ("Services") described in the Statement of Work attached hereto as Exhibit A and incorporated herein by reference.</p><p>1.2 Performance Standard. Contractor shall perform the Services in a professional and workmanlike manner in accordance with generally recognized industry standards for similar services.</p><h2>2. TERM AND TERMINATION</h2><p>2.1 Term. This Agreement shall commence on the Effective Date and shall continue until the Services are completed unless earlier terminated as provided herein.</p><p>2.2 Termination for Convenience. Client may terminate this Agreement for any reason upon {{terminationNoticeDays}} days' prior written notice to Contractor. Contractor shall be paid for all Services performed and expenses incurred up to the effective date of termination.</p><p>2.3 Termination for Cause. Either party may terminate this Agreement for cause upon written notice if the other party materially breaches this Agreement and fails to cure such breach within {{curePeriodDays}} days after receiving written notice of such breach.</p><h2>3. COMPENSATION</h2><p>3.1 Fees. Client shall pay Contractor the fees set forth in Exhibit A.</p><p>3.2 Expenses. Client shall reimburse Contractor for all reasonable expenses incurred in the performance of the Services, provided that such expenses are approved in advance by Client.</p><p>3.3 Invoicing and Payment. Contractor shall invoice Client {{invoicingSchedule}}. Payment is due within {{paymentTermDays}} days of receipt of invoice.</p><h2>4. OWNERSHIP AND LICENSES</h2><p>4.1 Client Materials. Client owns all right, title, and interest in and to any materials provided by Client to Contractor.</p><p>4.2 Deliverables. Upon full payment of all amounts due under this Agreement, all deliverables specifically created by Contractor for Client as part of the Services shall be the property of Client.</p><h2>5. CONFIDENTIALITY</h2><p>5.1 Definition. "Confidential Information" means all non-public information disclosed by one party to the other that is designated as confidential or that, given the nature of the information or circumstances surrounding its disclosure, reasonably should be considered confidential.</p><p>5.2 Obligations. Each party shall maintain the confidentiality of the other party's Confidential Information and shall not disclose such Confidential Information without the prior written consent of the disclosing party.</p><h2>6. WARRANTIES AND DISCLAIMERS</h2><p>6.1 Mutual Warranties. Each party represents and warrants that it has the legal power and authority to enter into this Agreement.</p><p>6.2 Disclaimer. EXCEPT AS EXPRESSLY PROVIDED HEREIN, CONTRACTOR MAKES NO WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, AND SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES.</p><h2>7. LIMITATION OF LIABILITY</h2><p>7.1 Limitation. NEITHER PARTY SHALL BE LIABLE TO THE OTHER PARTY FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO THIS AGREEMENT.</p><p>7.2 Cap. IN NO EVENT SHALL CONTRACTOR'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT PAID BY CLIENT UNDER THIS AGREEMENT.</p><h2>8. GENERAL PROVISIONS</h2><p>8.1 Independent Contractor. Contractor is an independent contractor. Nothing in this Agreement shall be construed as creating an employer-employee relationship.</p><p>8.2 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of {{governingState}}.</p><p>8.3 Entire Agreement. This Agreement constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior agreements.</p><div class="signature-section"><p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.</p><div class="signature-block"><p>CONTRACTOR:</p><p>{{companyName}}</p><p>By: _________________________</p><p>Name: {{companySignerName}}</p><p>Title: {{companySignerTitle}}</p><p>Date: _________________________</p></div><div class="signature-block"><p>CLIENT:</p><p>{{clientName}}</p><p>By: _________________________</p><p>Name: {{clientSignerName}}</p><p>Title: {{clientSignerTitle}}</p><p>Date: _________________________</p></div></div></div>`,
      isDefault: false
    },
    {
      type: 'estimate',
      title: 'Basic Estimate',
      description: 'Simple cost estimate template',
      body: '<div class="estimate"><h1>ESTIMATE</h1><div class="header-info"><p>{{companyName}}</p><p>Estimate #: {{estimateNumber}}</p><p>Date: {{currentDate}}</p><p>Valid Until: {{validUntilDate}}</p></div><div class="client-info"><h2>Client:</h2><p>{{clientName}}</p><p>{{clientAddress}}</p></div><div class="project-info"><h2>Project:</h2><p>{{projectName}}</p><p>{{projectAddress}}</p></div><table class="line-items"><tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>{{#items}}<tr><td>{{description}}</td><td>{{quantity}}</td><td>${{unitPrice}}</td><td>${{itemTotal}}</td></tr>{{/items}}</table><div class="estimate-totals"><p>Subtotal: ${{subtotal}}</p><p>Tax ({{taxRate}}%): ${{taxAmount}}</p><p>Total: ${{total}}</p></div><div class="notes"><h3>Notes:</h3><p>{{notes}}</p></div><div class="terms"><h3>Terms and Conditions:</h3><p>{{terms}}</p></div><div class="approval"><p>To accept this estimate, please sign below:</p><div class="signature-line"><p>Signature: ___________________________________</p><p>Date: ___________________________________</p></div></div></div>',
      isDefault: true
    },
    {
      type: 'estimate',
      title: 'Detailed Estimate',
      description: 'Detailed cost estimate with sections and options',
      body: '<div class="estimate-container"><div class="company-header"><img src="{{companyLogo}}" alt="Company Logo"><div class="company-info"><h1>{{companyName}}</h1><p>{{companyAddress}}</p><p>{{companyPhone}} | {{companyEmail}}</p></div></div><div class="estimate-header"><h1>ESTIMATE</h1><div class="estimate-info"><p>Estimate #: {{estimateNumber}}</p><p>Date: {{currentDate}}</p><p>Valid Until: {{validUntilDate}}</p></div></div><div class="client-info"><h2>CLIENT INFORMATION</h2><p><strong>Name:</strong> {{clientName}}</p><p><strong>Address:</strong> {{clientAddress}}</p><p><strong>Phone:</strong> {{clientPhone}}</p><p><strong>Email:</strong> {{clientEmail}}</p></div><div class="project-info"><h2>PROJECT INFORMATION</h2><p><strong>Project Name:</strong> {{projectName}}</p><p><strong>Project Address:</strong> {{projectAddress}}</p><p><strong>Project Description:</strong> {{projectDescription}}</p></div><div class="scope-section"><h2>SCOPE OF WORK</h2><p>{{scopeDescription}}</p><div class="scope-items">{{#scopeSections}}<div class="scope-section"><h3>{{sectionName}}</h3><ul>{{#items}}<li>{{.}}</li>{{/items}}</ul></div>{{/scopeSections}}</div></div><div class="pricing-section"><h2>PRICING BREAKDOWN</h2>{{#pricingSections}}<div class="pricing-section"><h3>{{sectionName}}</h3><table class="pricing-table"><tr><th>Description</th><th>Quantity</th><th>Unit</th><th>Rate</th><th>Total</th></tr>{{#items}}<tr><td>{{description}}</td><td>{{quantity}}</td><td>{{unit}}</td><td>${{rate}}</td><td>${{total}}</td></tr>{{/items}}<tr class="section-total"><td colspan="4">Section Total:</td><td>${{sectionTotal}}</td></tr></table></div>{{/pricingSections}}</div><div class="options-section"><h2>OPTIONS & ALTERNATIVES</h2><p>The following options are available at an additional cost:</p>{{#options}}<div class="option"><h3>Option {{number}}: {{name}}</h3><p>{{description}}</p><p><strong>Additional Cost:</strong> ${{cost}}</p></div>{{/options}}</div><div class="estimate-summary"><h2>ESTIMATE SUMMARY</h2><div class="summary-table"><div class="summary-row"><div class="summary-label">Subtotal:</div><div class="summary-value">${{subtotal}}</div></div><div class="summary-row"><div class="summary-label">Tax ({{taxRate}}%):</div><div class="summary-value">${{taxAmount}}</div></div>{{#fees}}<div class="summary-row"><div class="summary-label">{{name}}:</div><div class="summary-value">${{amount}}</div></div>{{/fees}}<div class="summary-row total"><div class="summary-label">Total Estimate:</div><div class="summary-value">${{total}}</div></div></div></div><div class="payment-schedule"><h2>PAYMENT SCHEDULE</h2><table class="payment-table"><tr><th>Payment</th><th>Due Date</th><th>Amount</th><th>Description</th></tr>{{#payments}}<tr><td>{{name}}</td><td>{{dueDate}}</td><td>${{amount}}</td><td>{{description}}</td></tr>{{/payments}}</table></div><div class="terms-section"><h2>TERMS & CONDITIONS</h2><p>{{termsText}}</p></div><div class="approval-section"><h2>ACCEPTANCE</h2><p>By signing below, I accept this estimate and authorize the work to proceed as specified.</p><div class="signature-area"><div class="customer-signature"><p>Customer Signature: _________________________________</p><p>Print Name: _________________________________</p><p>Date: _________________________________</p></div><div class="company-signature"><p>Company Representative: _________________________________</p><p>Print Name: _________________________________</p><p>Date: _________________________________</p></div></div></div></div>',
      isDefault: false
    },
    {
      type: 'receipt',
      title: 'Standard Receipt',
      description: 'Basic receipt template',
      body: '<div class="receipt"><h1>RECEIPT</h1><div class="receipt-header"><p>{{companyName}}</p><p>Receipt #: {{receiptNumber}}</p><p>Date: {{currentDate}}</p></div><div class="customer-info"><p><strong>Customer:</strong> {{customerName}}</p></div><div class="payment-details"><p><strong>Payment Method:</strong> {{paymentMethod}}</p><p><strong>Payment Date:</strong> {{paymentDate}}</p></div><table class="items-table"><tr><th>Description</th><th>Amount</th></tr>{{#items}}<tr><td>{{description}}</td><td>${{amount}}</td></tr>{{/items}}</table><div class="receipt-total"><p><strong>Total:</strong> ${{total}}</p></div><div class="receipt-footer"><p>Thank you for your business!</p></div></div>',
      isDefault: true
    }
  ];

  for (let i = 0; i < 20; i++) {
    templates.push({
      type: ['project_report', 'maintenance_plan', 'warranty', 'thank_you', 'quote'][i % 5],
      title: `Template ${i + 1}`,
      description: `Description for template ${i + 1}`,
      body: `<h1>Template ${i + 1}</h1><p>This is a sample template body for template number ${i + 1}.</p><div>{{variable1}}</div><div>{{variable2}}</div>`,
      isDefault: i % 5 === 0
    });
  }

  // Create templates in the database
  for (const template of templates) {
    try {
      await prisma.template.create({
        data: template
      });
    } catch (error) {
      console.error(`Failed to create template ${template.title}:`, error);
    }
  }

  console.log('Demo templates created successfully');
}


main();
