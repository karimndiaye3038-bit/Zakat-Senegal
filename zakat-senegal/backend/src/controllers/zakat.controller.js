import ZakatCalculation from '../models/ZakatCalculation.js';
import Setting from '../models/Setting.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { audit } from '../utils/audit.js';
import { getZakatSettings, publicSettings } from '../services/settings.service.js';
import { calculateZakat } from '../services/zakat.service.js';

export const getSettings = asyncHandler(async (req, res) => {
  res.json(publicSettings(await getZakatSettings()));
});

export const calculate = asyncHandler(async (req, res) => {
  const settings = await getZakatSettings();
  const result = calculateZakat(req.body.values, req.body.debts, settings.data);
  let saved = false;
  if (req.user) {
    await ZakatCalculation.create({
      user: req.user._id,
      inputs: { values: req.body.values, debts: req.body.debts },
      result,
      settingsVersion: settings.version,
    });
    saved = true;
  }
  res.json({ result, saved, settingsVersion: settings.version, validated: settings.validated });
});

// Mise à jour des paramètres : crée une NOUVELLE version (historique conservé) – admin uniquement.
export const updateSettings = asyncHandler(async (req, res) => {
  const { validated, validatedBy, ...data } = req.body;
  const current = await getZakatSettings();
  const doc = await Setting.create({
    key: 'zakat',
    version: current.version + 1,
    data,
    validated,
    validatedBy: validated ? validatedBy : undefined,
    createdBy: req.user._id,
  });
  await audit(req, 'settings.update', `setting:zakat:v${doc.version}`, 'success', { validated });
  res.json(publicSettings(doc));
});
