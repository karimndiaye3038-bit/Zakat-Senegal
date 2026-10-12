import { Router } from 'express';
import { publicReport } from '../controllers/report.controller.js';
import { createContact } from '../controllers/admin.controller.js';
import { validate } from '../middlewares/validate.js';
import { sensitiveLimiter } from '../middlewares/rateLimit.js';
import { contactSchema } from '../validators/admin.validator.js';

const r = Router();
r.get('/reports/public', publicReport);
r.post('/contact', sensitiveLimiter, validate(contactSchema), createContact);
export default r;
