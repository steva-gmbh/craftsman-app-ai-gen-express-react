import express from 'express';
import {
  getTools,
  getTool,
  createTool,
  updateTool,
  deleteTool,
} from '../controllers/tools';

const router = express.Router();

router.get('/', getTools);
router.get('/:id', getTool);
router.post('/', createTool);
router.put('/:id', updateTool);
router.delete('/:id', deleteTool);

export default router; 