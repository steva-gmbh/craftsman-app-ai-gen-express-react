import express from 'express';
import {
  getJobTools,
  addJobTool,
  updateJobTool,
  removeJobTool,
} from '../controllers/jobTools';

const router = express.Router();

router.get('/:jobId', getJobTools);
router.post('/:jobId', addJobTool);
router.put('/:jobId/:toolId', updateJobTool);
router.delete('/:jobId/:toolId', removeJobTool);

export default router; 