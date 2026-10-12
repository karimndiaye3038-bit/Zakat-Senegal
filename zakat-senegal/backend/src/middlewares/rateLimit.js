import rateLimit from 'express-rate-limit';

const message = { message: 'Trop de requêtes. Réessayez dans quelques instants.' };

export const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 200, standardHeaders: true, legacyHeaders: false, message });
// Limitation renforcée des endpoints sensibles (connexion, réinitialisation…).
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message });
export const sensitiveLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message });
