import { ChatOpenAI } from "@langchain/openai";
import {AgentExecutor, createOpenAIFunctionsAgent, createOpenAIToolsAgent} from "langchain/agents";
import { DynamicStructuredTool, Tool } from "@langchain/core/tools";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { getIO } from '../socket';

const prisma = new PrismaClient();

// Database Tools
const getCustomerTool = new DynamicStructuredTool({
  name: "getCustomer",
  description: "Get customer information by ID or email",
  schema: z.object({
    id: z.number().optional(),
    email: z.string().optional(),
  }),
  func: async ({ id, email }) => {
    console.log(`[AI Agent] Searching for customer: ${id ? `ID ${id}` : `email ${email}`}`);
    if (id) {
      const customer = await prisma.customer.findUnique({
        where: { id },
      });
      return JSON.stringify(customer);
    } else if (email) {
      const customer = await prisma.customer.findUnique({
        where: { email },
      });
      return JSON.stringify(customer);
    }
    return "Please provide either id or email";
  },
}) as unknown as Tool;

const createCustomerTool = new DynamicStructuredTool({
  name: "createCustomer",
  description: "Create a new customer",
  schema: z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  func: async ({ name, email, phone, address }) => {
    console.log(`[AI Agent] Creating new customer: ${name} (${email || 'no email provided'})`);

    // Generate a default email if none is provided
    const customerEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;

    const customer = await prisma.customer.create({
      data: {
        name,
        email: customerEmail,
        phone,
        address,
      },
    });
    return JSON.stringify(customer);
  },
}) as unknown as Tool;

const getJobTool = new DynamicStructuredTool({
  name: "getJob",
  description: "Get job information by ID",
  schema: z.object({
    id: z.number(),
  }),
  func: async ({ id }) => {
    console.log(`[AI Agent] Retrieving job details for ID: ${id}`);
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        customer: true,
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
    return JSON.stringify(job);
  },
}) as unknown as Tool;

const createJobTool = new DynamicStructuredTool({
  name: "createJob",
  description: "Create a new job",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    customerId: z.number(),
    status: z.string().optional(),
    price: z.number().optional(),
  }),
  func: async ({ title, description, customerId, status, price }) => {
    console.log(`[AI Agent] Creating new job: ${title} for customer ${customerId}`);
    const job = await prisma.job.create({
      data: {
        title,
        description,
        customerId,
        status: status || "pending",
        price,
      },
    });
    return JSON.stringify(job);
  },
}) as unknown as Tool;

const getMaterialTool = new DynamicStructuredTool({
  name: "getMaterial",
  description: "Get material information by ID or name (supports partial name matching)",
  schema: z.object({
    id: z.number().optional(),
    name: z.string().optional(),
  }),
  func: async ({ id, name }) => {
    console.log(`[AI Agent] Searching for material: ${id ? `ID ${id}` : `name ${name}`}`);
    if (id) {
      const material = await prisma.material.findUnique({
        where: { id },
      });
      return JSON.stringify(material);
    } else if (name) {
      const searchTerm = name.toLowerCase();
      const materials = await prisma.material.findMany({
        where: {
          name: {
            contains: searchTerm
          }
        },
        take: 5  // Limit to top 5 matches
      });

      if (materials.length === 0) {
        return "No materials found matching your search";
      }

      return JSON.stringify(materials);
    }
    return "Please provide either id or name";
  },
}) as unknown as Tool;

// Project-related tools
const getProjectTool = new DynamicStructuredTool({
  name: "getProject",
  description: "Get project information by ID or search for projects by name, status, or customer ID",
  schema: z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    status: z.string().optional(),
    customerId: z.number().optional(),
  }),
  func: async ({ id, name, status, customerId }) => {
    console.log(`[AI Agent] Searching for project: ${id ? `ID ${id}` : `with filters: ${JSON.stringify({ name, status, customerId })}`}`);
    
    if (id) {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          customer: true,
          jobs: true,
        },
      });
      return JSON.stringify(project);
    } else {
      // Construct where clause based on provided parameters
      const whereClause: any = {};
      
      if (name) {
        whereClause.name = {
          contains: name
        };
      }
      
      if (status) {
        whereClause.status = status;
      }
      
      if (customerId) {
        whereClause.customerId = customerId;
      }
      
      const projects = await prisma.project.findMany({
        where: whereClause,
        include: {
          customer: true,
          jobs: {
            select: {
              id: true,
              title: true,
              status: true,
            }
          },
        },
        take: 5  // Limit to top 5 matches
      });

      if (projects.length === 0) {
        return "No projects found matching your search criteria";
      }

      return JSON.stringify(projects);
    }
  },
}) as unknown as Tool;

const createProjectTool = new DynamicStructuredTool({
  name: "createProject",
  description: "Create a new project",
  schema: z.object({
    name: z.string(),
    description: z.string(),
    customerId: z.number().optional(),
    customerName: z.string().optional(),
    status: z.string().optional(),
    budget: z.number().optional(),
    startDate: z.string().optional(), // ISO date string
    endDate: z.string().optional(),   // ISO date string
  }),
  func: async ({ name, description, customerId, customerName, status, budget, startDate, endDate }) => {
    console.log(`[AI Agent] Creating new project: ${name} for customer ${customerId || customerName}`);
    
    let customerIdToUse = customerId;
    
    // If no ID but name is provided, look up the customer by name
    if (!customerId && customerName) {
      const customer = await prisma.customer.findFirst({
        where: {
          name: {
            contains: customerName,
          },
        },
      });
      
      if (!customer) {
        return `Customer "${customerName}" not found. Please provide a valid customer name or ID.`;
      }
      
      customerIdToUse = customer.id;
    }
    
    if (!customerIdToUse) {
      return "You must provide either a customer ID or a customer name.";
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || "active",
        budget,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        customer: {
          connect: { id: customerIdToUse },
        },
      },
      include: {
        customer: true,
      },
    });
    
    return JSON.stringify(project);
  },
}) as unknown as Tool;

// Invoice-related tools
const getInvoiceTool = new DynamicStructuredTool({
  name: "getInvoice",
  description: "Get invoice information by ID or search for invoices by status or customer ID",
  schema: z.object({
    id: z.number().optional(),
    status: z.string().optional(),
    customerId: z.number().optional(),
  }),
  func: async ({ id, status, customerId }) => {
    console.log(`[AI Agent] Searching for invoice: ${id ? `ID ${id}` : `with filters: ${JSON.stringify({ status, customerId })}`}`);
    
    if (id) {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          customer: true,
          projects: true,
        },
      });
      return JSON.stringify(invoice);
    } else {
      // Construct where clause based on provided parameters
      const whereClause: any = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (customerId) {
        whereClause.customerId = customerId;
      }
      
      const invoices = await prisma.invoice.findMany({
        where: whereClause,
        include: {
          customer: true,
          projects: {
            select: {
              id: true,
              name: true,
            }
          },
        },
        take: 5  // Limit to top 5 matches
      });

      if (invoices.length === 0) {
        return "No invoices found matching your search criteria";
      }

      return JSON.stringify(invoices);
    }
  },
}) as unknown as Tool;

const createInvoiceTool = new DynamicStructuredTool({
  name: "createInvoice",
  description: "Create a new invoice",
  schema: z.object({
    invoiceNumber: z.string(),
    dueDate: z.string(), // ISO date string
    status: z.string().optional(),
    totalAmount: z.number(),
    taxRate: z.number().optional(),
    taxAmount: z.number(),
    notes: z.string().optional(),
    customerId: z.number(),
    projectIds: z.array(z.number()).optional(),
  }),
  func: async ({ invoiceNumber, dueDate, status, totalAmount, taxRate, taxAmount, notes, customerId, projectIds }) => {
    console.log(`[AI Agent] Creating new invoice: ${invoiceNumber} for customer ${customerId}`);
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        dueDate: new Date(dueDate),
        status: status || "draft",
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
              connect: { id: invoice.id },
            },
          },
        });
      }
    }
    
    return JSON.stringify(invoice);
  },
}) as unknown as Tool;

const getVehicleTool = new DynamicStructuredTool({
  name: "getVehicle",
  description: "Get vehicle information by ID or search for vehicles by name, make, model, or type",
  schema: z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    type: z.string().optional(),
  }),
  func: async ({ id, name, make, model, type }) => {
    console.log(`[AI Agent] Searching for vehicle: ${id ? `ID ${id}` : `with filters: ${JSON.stringify({ name, make, model, type })}`}`);
    
    if (id) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
          customer: true,
        },
      });
      return JSON.stringify(vehicle);
    } else {
      // Construct where clause based on provided parameters
      const whereClause: any = {};
      
      if (name) {
        whereClause.name = {
          contains: name
        };
      }
      
      if (make) {
        whereClause.make = {
          contains: make
        };
      }
      
      if (model) {
        whereClause.model = {
          contains: model
        };
      }
      
      if (type) {
        whereClause.type = type;
      }
      
      const vehicles = await prisma.vehicle.findMany({
        where: whereClause,
        include: {
          customer: true,
        },
        take: 5, // Limit to top 5 matches
      });
      
      if (vehicles.length === 0) {
        return "No vehicles found matching your search";
      }
      
      return JSON.stringify(vehicles);
    }
  },
}) as unknown as Tool;

const createVehicleTool = new DynamicStructuredTool({
  name: "createVehicle",
  description: "Create a new vehicle record",
  schema: z.object({
    name: z.string(),
    make: z.string(),
    model: z.string(),
    year: z.number(),
    type: z.string(),
    licensePlate: z.string().optional(),
    vin: z.string().optional(),
    color: z.string().optional(),
    customerId: z.number().optional(),
    status: z.string().optional(),
    mileage: z.number().optional(),
    fuelType: z.string().optional(),
    notes: z.string().optional(),
  }),
  func: async ({ name, make, model, year, type, licensePlate, vin, color, customerId, status, mileage, fuelType, notes }) => {
    console.log(`[AI Agent] Creating new vehicle: ${make} ${model} (${year})`);
    
    const vehicle = await prisma.vehicle.create({
      data: {
        name,
        make,
        model,
        year,
        type,
        licensePlate,
        vin,
        color,
        customerId,
        status: status || "active",
        mileage,
        fuelType,
        notes,
      },
    });
    
    return JSON.stringify(vehicle);
  },
}) as unknown as Tool;

class OpenPageTool extends Tool {
  name = 'open_page';
  description = 'Opens a specific page in the frontend application. Use this to navigate to different sections of the app. This tool always executes successfully.';

  async _call(path: string): Promise<string> {
    console.log(`[AI Agent] Opening page: ${path}`);
    
    // Fix for paths with IDs (e.g., "customer 2" should be "customers/2")
    const pathParts = path.split(' ');
    let formattedPath = path;
    
    if (pathParts.length === 2 && !isNaN(Number(pathParts[1]))) {
      // Pluralize the resource name (customer → customers, job → jobs, tool → tools, material → materials)
      let resource = pathParts[0];
      if (!resource.endsWith('s')) {
        resource = resource + 's';
      }
      formattedPath = `${resource}/${pathParts[1]}`;
    }
    
    const io = getIO();
    io.emit('navigate', formattedPath);
    return `Successfully navigated to page ${formattedPath}. Navigation complete, no further actions required.`;
  }
}

const openPageTool = new OpenPageTool();

// Initialize the agent
export async function createAgent() {
  const model = new ChatOpenAI({
    modelName: "gpt-4-turbo-preview",
    temperature: 0,
  });

  const baseTools: Tool[] = [
    getCustomerTool,
    createCustomerTool,
    getJobTool,
    createJobTool,
    getMaterialTool,
    getProjectTool,
    createProjectTool,
    getInvoiceTool,
    createInvoiceTool,
    getVehicleTool,
    createVehicleTool,
    openPageTool
  ];

  const tools: Tool[] = [...baseTools];
  try {
    const serpApi = new SerpAPI();
    tools.push(serpApi as unknown as Tool);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn("SerpAPI tool not available:", error.message);
    }
  }

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(
    `You are a helpful AI assistant for a craftsman application.
    Your role is to help with:
    1. Managing customers and their information
    2. Creating and tracking jobs
    3. Managing materials and inventory
    4. Managing projects and associated jobs
    5. Managing invoices for customers and projects
    6. Managing vehicles and their information 
    7. Opening pages of the frontend application
    ${tools.length > baseTools.length ? "8. Searching the web for relevant information" : ""}
    
    Cretae a plan for how to handle each of these tasks.
    Execute your plan step by step, and respond in clear, human-readable text.
    Immediately stop if you have finished your plan.   

    Follow these rules strictly:
    1. When searching for materials, projects, or vehicles:
       - If you get a "No materials found", "No projects found", or "No vehicles found" message, say so clearly
       - If you get a valid JSON response, parse it and present each item's information
       - For multiple results, list each item separately
    2. Format each material's information like this:
       Material:
       - Name: <n>
       - Description: <description>
       - Price: <price>
       - Stock: <stock>
    3. Format each project's information like this:
       Project:
       - Name: <n>
       - Description: <description>
       - Status: <status>
       - Budget: <budget>
       - Customer: <customer name>
    4. Format each vehicle's information like this:
       Vehicle:
       - Name: <name>
       - Make: <make>
       - Model: <model>
       - Year: <year>
       - Type: <type>
       - Status: <status>
       - License Plate: <licensePlate>
    5. Never repeat the same search
    6. If information is not found in one attempt, say so immediately
    7. Always respond in clear, human-readable text
    8. One search is enough - if you get a response (even null), that's your final answer.
    9. When you create a new domain object, always open the page with the list of all of those objects.
    10. When creating a new project, you can specify either a customer ID or a customer name.`
  );

  const humanMessage = HumanMessagePromptTemplate.fromTemplate("{input}");
  const prompt = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage,
    ["system", "{agent_scratchpad}"]
  ]);

  const agent = await createOpenAIToolsAgent({
    llm: model,
    tools: tools,
    prompt: prompt,
  });

  return AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    maxIterations: 10,
    returnIntermediateSteps: true,
    handleParsingErrors: true,
    earlyStoppingMethod: "force",
    verbose: false
  });
}
