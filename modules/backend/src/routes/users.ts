import express, { Router, RequestHandler } from 'express';
import { 
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/users';

const router: Router = express.Router();

router.get('/', getAllUsers as RequestHandler);
router.get('/:id', getUserById as RequestHandler);
router.post('/', createUser as RequestHandler);
router.put('/:id', updateUser as RequestHandler);
router.delete('/:id', deleteUser as RequestHandler);

export default router;