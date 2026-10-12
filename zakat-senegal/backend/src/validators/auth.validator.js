import { z } from 'zod';
import { optionalString, phoneSchema } from './common.js';

const password = z.string().min(8, 'Au moins 8 caractères').max(128);

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Nom requis').max(100),
    email: optionalString(z.string().trim().toLowerCase().email('E-mail invalide')),
    phone: optionalString(phoneSchema),
    password,
  })
  .refine((d) => d.email || d.phone, { message: 'E-mail ou téléphone requis', path: ['email'] });

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  password: z.string().min(1).max(128),
});
export const forgotSchema = z.object({ identifier: z.string().trim().min(3).max(120) });
export const resetSchema = z.object({ token: z.string().min(20).max(200), password });
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: optionalString(phoneSchema),
});
