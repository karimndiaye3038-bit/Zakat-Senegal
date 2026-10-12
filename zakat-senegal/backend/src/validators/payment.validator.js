import { z } from 'zod';
import { FUND_TYPES, PAYMENT_METHODS } from '../config/constants.js';
import { amountSchema } from './common.js';

export const initPaymentSchema = z.object({
  amount: amountSchema,
  type: z.enum(FUND_TYPES),
  method: z.enum(PAYMENT_METHODS),
});
export const sandboxCompleteSchema = z.object({ outcome: z.enum(['success', 'failed', 'cancelled']) });
export const webhookSchema = z.object({
  eventId: z.string().min(6).max(100),
  reference: z.string().min(6).max(60),
  status: z.enum(['success', 'failed', 'cancelled']),
  providerRef: z.string().max(100).optional(),
  reason: z.string().max(200).optional(),
});
