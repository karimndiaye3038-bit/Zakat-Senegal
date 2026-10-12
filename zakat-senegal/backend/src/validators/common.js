import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Identifiant invalide');
const emptyToUndefined = (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
export const optionalString = (schema) => z.preprocess(emptyToUndefined, schema.optional());
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s.-]/g, ''))
  .refine((v) => /^\+?\d{8,15}$/.test(v), 'Numéro de téléphone invalide');
export const amountSchema = z.coerce.number().int('Montant entier requis').positive().max(1_000_000_000);
