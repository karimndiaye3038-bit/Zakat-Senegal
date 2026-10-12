import { ZodError } from 'zod';
import multer from 'multer';
import { isProd } from '../config/env.js';

export const notFound = (req, res) => res.status(404).json({ message: 'Ressource introuvable.' });

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return res.status(400).json({ message: details[0]?.message || 'Données invalides.', details });
  }
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux (5 Mo maximum).' : 'Téléversement invalide.';
    return res.status(400).json({ message: msg });
  }
  if (err.code === 11000) return res.status(409).json({ message: 'Cette valeur existe déjà (e-mail ou téléphone).' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Identifiant invalide.' });
  if (err.status) return res.status(err.status).json({ message: err.message, details: err.details });

  console.error(err);
  res.status(500).json({ message: isProd ? 'Erreur interne du serveur.' : err.message });
}
