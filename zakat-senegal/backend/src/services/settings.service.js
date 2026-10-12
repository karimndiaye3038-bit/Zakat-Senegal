import Setting from '../models/Setting.js';
import { DEFAULT_ZAKAT_SETTINGS } from '../config/constants.js';

// Retourne la dernière version des paramètres du calculateur (la crée si absente).
export async function getZakatSettings() {
  let doc = await Setting.findOne({ key: 'zakat' }).sort({ version: -1 });
  if (!doc) {
    doc = await Setting.create({ key: 'zakat', version: 1, data: DEFAULT_ZAKAT_SETTINGS, validated: false });
  }
  return doc;
}

export const publicSettings = (doc) => ({
  version: doc.version,
  validated: doc.validated,
  validatedBy: doc.validatedBy,
  effectiveDate: doc.effectiveDate,
  ...doc.data,
});
