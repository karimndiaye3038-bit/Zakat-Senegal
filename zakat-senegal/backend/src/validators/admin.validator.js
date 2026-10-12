import { z } from 'zod';
import { ALL_ROLES, DISTRIBUTION_MODES, FUND_TYPES } from '../config/constants.js';
import { amountSchema, objectId } from './common.js';

export const roleSchema = z.object({ role: z.enum(ALL_ROLES) });
export const activeSchema = z.object({ active: z.boolean() });
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  contact: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
});
export const planSchema = z.object({
  name: z.string().trim().min(2).max(120),
  fundType: z.enum(FUND_TYPES).default('zakat'),
  category: z.string().trim().max(60).optional(),
  zone: z.string().trim().max(60).optional(),
  budget: z.coerce.number().min(0).max(1e13),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export const distributionSchema = z.object({
  aidRequestId: objectId,
  planId: objectId.optional(),
  fundType: z.enum(FUND_TYPES).default('zakat'),
  amount: amountSchema,
  mode: z.enum(DISTRIBUTION_MODES).default('mobile_money'),
  note: z.string().trim().max(500).optional(),
});
export const deliverSchema = z.object({
  proofRef: z.string().trim().min(3).max(120),
  deliveredAt: z.string().optional(),
});
