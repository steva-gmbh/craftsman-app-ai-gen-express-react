import express, {RequestHandler} from 'express';
import {
  getSettings,
  getSettingsByUserId,
  createSettings,
  updateSettings,
  deleteSettings,
} from '../controllers/settings';

const router = express.Router();

router.get('/', getSettings as RequestHandler);
router.get('/:userId', getSettingsByUserId as RequestHandler);
router.post('/', createSettings as RequestHandler);
router.put('/:userId', updateSettings as RequestHandler);
router.delete('/:userId', deleteSettings as RequestHandler);

export default router;
