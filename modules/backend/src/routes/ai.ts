import express, {RequestHandler} from 'express';
import { handleAiChat } from '../controllers/ai';

const router = express.Router();

router.post('/chat', handleAiChat as RequestHandler);

export default router;
