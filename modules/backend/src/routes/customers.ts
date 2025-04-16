import express, {RequestHandler} from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customers';

const router = express.Router();

router.get('/', getCustomers as RequestHandler);
router.get('/:id', getCustomer as RequestHandler);
router.post('/', createCustomer as RequestHandler);
router.put('/:id', updateCustomer as RequestHandler);
router.delete('/:id', deleteCustomer as RequestHandler);

export default router;
