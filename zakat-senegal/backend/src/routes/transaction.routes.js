import { Router } from 'express';
import * as c from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.js';

const r = Router();
r.use(protect);
r.get('/me', c.myTransactions);
r.get('/:reference', c.getByReference);
r.get('/:reference/receipt', c.getReceipt);
export default r;
