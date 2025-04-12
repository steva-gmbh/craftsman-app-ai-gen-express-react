import express from 'express';
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

const router = express.Router();

// Job routes
router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

// Job materials routes
router.get('/:jobId/materials', getJobMaterials);
router.post('/:jobId/materials', addJobMaterial);
router.put('/:jobId/materials/:materialId', updateJobMaterial);
router.delete('/:jobId/materials/:materialId', removeJobMaterial);

export default router; 