import express from 'express';
import {
  getSettings,
  getSettingsByUserId,
  createSettings,
  updateSettings,
  deleteSettings,
} from '../controllers/settings';

const router = express.Router();

router.get('/', getSettings);
router.get('/:userId', getSettingsByUserId);
router.post('/', createSettings);
router.put('/:userId', updateSettings);
router.delete('/:userId', deleteSettings);

export default router; 