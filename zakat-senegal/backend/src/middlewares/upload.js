import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadRoot = path.resolve(env.uploadDir);
fs.mkdirSync(uploadRoot, { recursive: true });

const ALLOWED = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png' };

// Stockage privé : le dossier n'est jamais exposé en statique. Noms aléatoires, extension imposée par le type.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + ALLOWED[file.mimetype]),
});

export const uploadDocuments = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED[file.mimetype]) return cb(new ApiError(400, 'Format refusé : PDF, JPG ou PNG uniquement.'));
    cb(null, true);
  },
}).array('documents', 5);

export function removeFiles(files = []) {
  files.forEach((f) => fs.unlink(f.path, () => {}));
}
