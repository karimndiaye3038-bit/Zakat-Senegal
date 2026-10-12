import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import { registerSchema, loginSchema, forgotSchema, resetSchema, profileSchema } from '../validators/auth.validator.js';

const r = Router();
r.post('/register', authLimiter, validate(registerSchema), c.register);
r.post('/login', authLimiter, validate(loginSchema), c.login);
r.post('/forgot-password', authLimiter, validate(forgotSchema), c.forgotPassword);
r.post('/reset-password', authLimiter, validate(resetSchema), c.resetPassword);
r.get('/me', protect, c.me);
r.patch('/me', protect, validate(profileSchema), c.updateProfile);
export default r;
