import { Request, Response } from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
});

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Convert history to LangChain messages
    const messages = history?.map((msg: { role: string; content: string }) => {
      return msg.role === 'user' 
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content);
    }) || [];

    // Add the new message
    messages.push(new HumanMessage(message));

    const response = await chatModel.invoke(messages);

    res.json({
      content: response.content.toString(),
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};
