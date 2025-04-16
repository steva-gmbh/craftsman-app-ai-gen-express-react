import express, {RequestHandler} from 'express';
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../controllers/materials';

const router = express.Router();

router.get('/', getMaterials as RequestHandler);
router.get('/:id', getMaterial as RequestHandler);
router.post('/', createMaterial as RequestHandler);
router.put('/:id', updateMaterial as RequestHandler);
router.delete('/:id', deleteMaterial as RequestHandler);

export default router;
