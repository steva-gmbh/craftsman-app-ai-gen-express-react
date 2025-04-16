import express, {RequestHandler} from 'express';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicles';

const router = express.Router();

router.get('/', getVehicles as RequestHandler);
router.get('/:id', getVehicle as RequestHandler);
router.post('/', createVehicle as RequestHandler);
router.put('/:id', updateVehicle as RequestHandler);
router.delete('/:id', deleteVehicle as RequestHandler);

export default router;
