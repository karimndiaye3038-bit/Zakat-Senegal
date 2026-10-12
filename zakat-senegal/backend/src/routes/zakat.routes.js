import { Router } from 'express';
import * as c from '../controllers/zakat.controller.js';
import { optionalAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { calculateSchema } from '../validators/zakat.validator.js';

const r = Router();
r.post('/calculate', optionalAuth, validate(calculateSchema), c.calculate);
export default r;
