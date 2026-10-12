import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { env, isProd } from '../config/env.js';
import { ROLES } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sha256 } from '../utils/generate.js';
import { audit } from '../utils/audit.js';
import { notifyUser } from '../services/notification.service.js';

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt });

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const exists = await User.findOne({ $or: [email ? { email } : null, phone ? { phone } : null].filter(Boolean) });
  if (exists) throw new ApiError(409, 'Un compte existe déjà avec cet e-mail ou ce téléphone.');

  // Le rôle n'est JAMAIS lu depuis la requête : tout nouveau compte est "user".
  const user = await User.create({ name, email, phone, password: await bcrypt.hash(password, 12), role: ROLES.USER });
  req.user = user;
  await audit(req, 'auth.register', `user:${user._id}`);
  await notifyUser(user, 'welcome', 'Bienvenue sur Zakat Sénégal. Votre compte est créé.');
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const id = identifier.includes('@') ? identifier.toLowerCase() : identifier.replace(/[\s.-]/g, '');
  const user = await User.findOne(id.includes('@') ? { email: id } : { phone: id }).select('+password');
  const ok = user && user.active && (await bcrypt.compare(password, user.password));
  if (!ok) {
    await audit({ ip: req.ip }, 'auth.login', `identifier:${id.slice(0, 3)}***`, 'failure');
    throw new ApiError(401, 'Identifiants incorrects.'); // message générique volontaire
  }
  user.lastLoginAt = new Date();
  await user.save();
  req.user = user;
  await audit(req, 'auth.login', `user:${user._id}`);
  res.json({ token: signToken(user), user: publicUser(user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const id = req.body.identifier.includes('@') ? req.body.identifier.toLowerCase() : req.body.identifier.replace(/[\s.-]/g, '');
  const user = await User.findOne(id.includes('@') ? { email: id } : { phone: id });
  if (user && user.active) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = sha256(token);
    user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    const link = `${env.clientUrl}/reinitialiser-mot-de-passe?token=${token}`;
    await notifyUser(user, 'password_reset', `Réinitialisez votre mot de passe (valable 30 min) : ${link}`);
    if (!isProd) console.log('[dev] lien de réinitialisation :', link);
  }
  // Même réponse que le compte existe ou non (pas d'énumération de comptes).
  res.json({ message: 'Si un compte correspond, un lien de réinitialisation a été envoyé.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ resetTokenHash: sha256(req.body.token), resetTokenExpires: { $gt: new Date() } }).select(
    '+resetTokenHash +resetTokenExpires'
  );
  if (!user) throw new ApiError(400, 'Lien invalide ou expiré.');
  user.password = await bcrypt.hash(req.body.password, 12);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  req.user = user;
  await audit(req, 'auth.reset_password', `user:${user._id}`);
  res.json({ message: 'Mot de passe mis à jour. Vous pouvez vous connecter.' });
});

export const me = asyncHandler(async (req, res) => res.json({ user: publicUser(req.user) }));

export const updateProfile = asyncHandler(async (req, res) => {
  if (req.body.name) req.user.name = req.body.name;
  if (req.body.phone) req.user.phone = req.body.phone;
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});
