import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { DynamicStructuredTool, Tool } from "@langchain/core/tools";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

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
    email: z.string(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  func: async ({ name, email, phone, address }) => {
    console.log(`[AI Agent] Creating new customer: ${name} (${email})`);
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
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
    ${tools.length > baseTools.length ? "4. Searching the web for relevant information" : ""}

    Follow these rules strictly:
    1. When searching for materials:
       - If you get a "No materials found" message, say "No materials found matching your search"
       - If you get a valid JSON response, parse it and present each material's information
       - For multiple results, list each material separately
    2. Format each material's information like this:
       Material:
       - Name: <name>
       - Description: <description>
       - Price: <price>
       - Stock: <stock>
    3. Never repeat the same search
    4. If information is not found in one attempt, say so immediately
    5. Always respond in clear, human-readable text

    Remember: One search is enough - if you get a response (even null), that's your final answer.`
  );

  const humanMessage = HumanMessagePromptTemplate.fromTemplate("{input}");
  const prompt = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage,
    ["system", "{agent_scratchpad}"]
  ]);

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  });

  return AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    maxIterations: 10,
    returnIntermediateSteps: false,
    handleParsingErrors: true,
    earlyStoppingMethod: "force"
  });
}
