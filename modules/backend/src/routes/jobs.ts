import express, {RequestHandler} from 'express';
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobs';
import {
  getJobMaterials,
  addJobMaterial,
  updateJobMaterial,
  removeJobMaterial,
} from '../controllers/jobMaterials';
import {
  getJobTools,
  addJobTool,
  updateJobTool,
  removeJobTool,
} from '../controllers/jobTools';

const router = express.Router();

router.get('/', getJobs as RequestHandler);
router.get('/:id', getJob as RequestHandler);
router.post('/', createJob as RequestHandler);
router.put('/:id', updateJob as RequestHandler);
router.delete('/:id', deleteJob as RequestHandler);

router.get('/:jobId/materials', getJobMaterials as RequestHandler);
router.post('/:jobId/materials', addJobMaterial as RequestHandler);
router.put('/:jobId/materials/:materialId', updateJobMaterial as RequestHandler);
router.delete('/:jobId/materials/:materialId', removeJobMaterial as RequestHandler);

router.get('/:jobId/tools', getJobTools as RequestHandler);
router.post('/:jobId/tools', addJobTool as RequestHandler);
router.put('/:jobId/tools/:toolId', updateJobTool as RequestHandler);
router.delete('/:jobId/tools/:toolId', removeJobTool as RequestHandler);

export default router;
