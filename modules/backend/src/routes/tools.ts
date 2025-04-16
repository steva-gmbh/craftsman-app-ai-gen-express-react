import express, {RequestHandler} from 'express';
import {
  getTools,
  getTool,
  createTool,
  updateTool,
  deleteTool,
} from '../controllers/tools';

const router = express.Router();

router.get('/', getTools as RequestHandler);
router.get('/:id', getTool as RequestHandler);
router.post('/', createTool as RequestHandler);
router.put('/:id', updateTool as RequestHandler);
router.delete('/:id', deleteTool as RequestHandler);

export default router;
