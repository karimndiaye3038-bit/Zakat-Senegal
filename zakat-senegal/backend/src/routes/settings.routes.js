import { Router } from 'express';
import * as c from '../controllers/zakat.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { ROLES } from '../config/constants.js';
import { settingsSchema } from '../validators/zakat.validator.js';

const r = Router();
r.get('/zakat', c.getSettings); // paramètres publics du calculateur
r.put('/zakat', protect, authorize(ROLES.ADMIN), validate(settingsSchema), c.updateSettings);
export default r;
