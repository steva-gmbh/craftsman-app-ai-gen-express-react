import express, {RequestHandler} from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projects';

const router = express.Router();

router.get('/', getProjects as RequestHandler);
router.get('/:id', getProjectById as RequestHandler);
router.post('/', createProject as RequestHandler);
router.put('/:id', updateProject as RequestHandler);
router.delete('/:id', deleteProject as RequestHandler);

export default router;
