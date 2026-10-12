import { Router } from 'express';
import * as c from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { sensitiveLimiter } from '../middlewares/rateLimit.js';
import { initPaymentSchema, sandboxCompleteSchema } from '../validators/payment.validator.js';

const r = Router();
r.post('/initialize', protect, sensitiveLimiter, validate(initPaymentSchema), c.initialize);
r.post('/webhook', c.webhook); // authentifié par signature HMAC, pas par JWT
r.post('/sandbox/:reference/complete', protect, validate(sandboxCompleteSchema), c.sandboxComplete);
export default r;
