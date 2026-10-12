import Notification from '../models/Notification.js';
import { isProd } from '../config/env.js';

// Point d'entrée unique des notifications (e-mail / SMS).
// Les messages ne contiennent jamais de données sensibles.
// Brancher ici un vrai fournisseur (SMTP, SMS) : en développement, on journalise.
async function deliver(channel, to, message) {
  if (!isProd) console.log(`[notification:${channel}] -> ${to} : ${message}`);
  // TODO production : appel du fournisseur e-mail/SMS retenu ; lever une erreur en cas d'échec.
}

export async function notifyUser(user, type, message) {
  if (!user) return;
  const targets = [];
  if (user.email) targets.push(['email', user.email]);
  else if (user.phone) targets.push(['sms', user.phone]);

  for (const [channel, to] of targets) {
    try {
      await deliver(channel, to, message);
      await Notification.create({ user: user._id, channel, to, type, message, status: 'sent' });
    } catch (err) {
      await Notification.create({ user: user._id, channel, to, type, message, status: 'failed', error: err.message });
    }
  }
}
