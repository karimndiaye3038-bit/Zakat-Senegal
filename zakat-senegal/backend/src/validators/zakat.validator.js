import { z } from 'zod';

const money = z.coerce.number().min(0).max(1e13).default(0);
// Les clés de catégories sont libres (configurables) : on valide seulement des montants positifs.
export const calculateSchema = z.object({
  values: z.record(z.string().max(40), money).default({}),
  debts: money,
});

export const settingsSchema = z.object({
  nisabAmount: z.coerce.number().positive().max(1e13),
  rate: z.coerce.number().positive().max(1),
  referenceDate: z.string().min(8).max(20),
  method: z.string().trim().min(2).max(300),
  notes: z.string().trim().max(1000).default(''),
  allowDebtDeduction: z.boolean(),
  minDonation: z.coerce.number().int().min(100).max(1e9),
  doubleValidationThreshold: z.coerce.number().int().min(1000).max(1e12),
  categories: z
    .array(
      z.object({
        key: z.string().regex(/^[a-z0-9_]{2,30}$/),
        label: z.string().trim().min(2).max(100),
        hint: z.string().trim().max(160).default(''),
      })
    )
    .min(1)
    .max(15),
  validated: z.boolean().default(false),
  validatedBy: z.string().trim().max(120).optional(),
});
