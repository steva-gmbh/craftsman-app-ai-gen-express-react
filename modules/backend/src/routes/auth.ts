import express, { RequestHandler } from 'express';
import { login, register } from '../controllers/auths';

const router = express.Router();

router.post('/login', login as RequestHandler);
router.post('/register', register as RequestHandler);

export default router;