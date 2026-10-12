import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ROLES } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function loadUser(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    const user = await User.findById(payload.id);
    return user && user.active ? user : null;
  } catch {
    return null;
  }
}

// Authentification obligatoire. Le rôle est TOUJOURS relu en base : jamais fait confiance au client.
export const protect = asyncHandler(async (req, res, next) => {
  const user = await loadUser(req);
  if (!user) throw new ApiError(401, 'Authentification requise.');
  req.user = user;
  next();
});

// Authentification facultative (calculateur public, par ex.).
export const optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = await loadUser(req);
  next();
});

// Contrôle des permissions côté serveur. Le super-administrateur passe partout.
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentification requise.'));
  if (req.user.role === ROLES.SUPER || roles.includes(req.user.role)) return next();
  next(new ApiError(403, 'Accès refusé : droits insuffisants.'));
};
