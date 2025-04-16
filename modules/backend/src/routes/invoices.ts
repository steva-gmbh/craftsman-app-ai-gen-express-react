import express, {RequestHandler} from 'express';
import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, generateInvoicePdf } from '../controllers/invoices';

const router = express.Router();

router.get('/', getInvoices as RequestHandler);
router.get('/:id', getInvoice as RequestHandler);
router.get('/:id/pdf', generateInvoicePdf as RequestHandler);
router.post('/', createInvoice as RequestHandler);
router.put('/:id', updateInvoice as RequestHandler);
router.delete('/:id', deleteInvoice as RequestHandler);

export default router;
