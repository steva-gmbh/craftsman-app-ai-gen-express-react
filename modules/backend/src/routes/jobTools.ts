import express, {RequestHandler} from 'express';
import {
  getJobTools,
  addJobTool,
  updateJobTool,
  removeJobTool,
} from '../controllers/jobTools';

const router = express.Router();

router.get('/:jobId', getJobTools as RequestHandler);
router.post('/:jobId', addJobTool as RequestHandler);
router.put('/:jobId/:toolId', updateJobTool as RequestHandler);
router.delete('/:jobId/:toolId', removeJobTool as RequestHandler);

export default router;
