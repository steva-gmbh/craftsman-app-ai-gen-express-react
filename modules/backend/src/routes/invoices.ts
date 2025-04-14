import express from 'express';
import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice } from '../controllers/invoices';

const router = express.Router();

// GET all invoices
router.get('/', getInvoices);

// GET a single invoice
router.get('/:id', getInvoice);

// POST a new invoice
router.post('/', createInvoice);

// PUT/UPDATE an invoice
router.put('/:id', updateInvoice);

// DELETE an invoice
router.delete('/:id', deleteInvoice);

export default router; 