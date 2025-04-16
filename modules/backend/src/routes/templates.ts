import express, {RequestHandler} from 'express';
import { getTemplates, getTemplate, getDefaultTemplate, createTemplate, updateTemplate, deleteTemplate } from '../controllers/templates';

const router = express.Router();

router.get('/', getTemplates as RequestHandler);
router.get('/default/:type', getDefaultTemplate as RequestHandler);
router.get('/:id', getTemplate as RequestHandler);
router.post('/', createTemplate as RequestHandler);
router.put('/:id', updateTemplate as RequestHandler);
router.delete('/:id', deleteTemplate as RequestHandler);

export default router;
