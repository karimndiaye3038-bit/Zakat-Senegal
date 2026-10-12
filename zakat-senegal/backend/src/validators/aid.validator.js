import { z } from 'zod';
import { AID_CATEGORIES, AID_STATUSES, REGIONS } from '../config/constants.js';
import { phoneSchema } from './common.js';

export const aidRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  address: z.string().trim().min(3).max(250),
  region: z.enum(REGIONS),
  category: z.enum(AID_CATEGORIES),
  description: z.string().trim().min(20, 'Décrivez votre situation (20 caractères minimum)').max(3000),
  householdSize: z.coerce.number().int().min(1).max(60).default(1),
});
export const resubmitSchema = z.object({ message: z.string().trim().min(5).max(2000) });
export const statusSchema = z.object({
  status: z.enum(AID_STATUSES),
  reason: z.string().trim().max(1000).optional(),
  internalNote: z.string().trim().max(2000).optional(),
});
