import express from 'express';
import { getTemplates, getTemplate, getDefaultTemplate, createTemplate, updateTemplate, deleteTemplate } from '../controllers/templates';

const router = express.Router();

// GET all templates
router.get('/', getTemplates);

// GET default template for a specific type
router.get('/default/:type', getDefaultTemplate);

// GET a specific template
router.get('/:id', getTemplate);

// POST create new template
router.post('/', createTemplate);

// PUT update template
router.put('/:id', updateTemplate);

// DELETE template
router.delete('/:id', deleteTemplate);

export default router; 