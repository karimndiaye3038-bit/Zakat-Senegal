import { asyncHandler } from '../utils/asyncHandler.js';
import { getPublicStats } from '../services/stats.service.js';

export const publicReport = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json(await getPublicStats());
});
