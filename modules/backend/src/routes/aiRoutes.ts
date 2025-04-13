import { Router } from 'express';
import { chat } from '../controllers/aiController';

const router = Router();

router.post('/chat', chat);

export default router; 