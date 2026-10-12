import crypto from 'crypto';

// Référence lisible et non devinable : PREFIXE-2026-AB12CD34
export function makeReference(prefix) {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${year}-${rand}`;
}

export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
