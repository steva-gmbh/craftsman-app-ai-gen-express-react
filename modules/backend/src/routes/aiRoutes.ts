import express from 'express';
import { createAgent } from '../ai/agent';

const router = express.Router();

// Initialize the agent
let agent: Awaited<ReturnType<typeof createAgent>>;

// Initialize the agent when the server starts
createAgent().then((initializedAgent) => {
  agent = initializedAgent;
});

// Route to handle AI assistant requests
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!agent) {
      return res.status(503).json({ error: 'AI agent is not yet initialized' });
    }

    const result = await agent.invoke({
      input: message,
    });

    // Extract the actual response from the agent's output
    const response = result.output;
    
    // If the response starts with "ANSWER:", remove it and trim
    const cleanResponse = response.startsWith('ANSWER:') 
      ? response.substring(7).trim() 
      : response;

    res.json({ response: cleanResponse });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 