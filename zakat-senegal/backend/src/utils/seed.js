import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Receipt from '../models/Receipt.js';
import AidRequest from '../models/AidRequest.js';
import { getZakatSettings } from '../services/settings.service.js';
import { makeReference } from './generate.js';

const demo = process.argv.includes('--demo');

async function upsertUser({ name, email, role, password }) {
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ name, email, role, password: await bcrypt.hash(password, 12) });
  return user;
}

await connectDB();
await getZakatSettings(); // crée la version 1 des paramètres du calculateur (non validée)

const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@zakat-senegal.sn').toLowerCase();
const adminPass = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe#2026';
await upsertUser({ name: process.env.SEED_ADMIN_NAME || 'Super Admin', email: adminEmail, role: 'super_admin', password: adminPass });
console.log(`Super-administrateur : ${adminEmail}`);

if (demo) {
  const pass = 'Demo#2026pass';
  const agent = await upsertUser({ name: 'Awa Agent', email: 'agent@demo.sn', role: 'agent', password: pass });
  await upsertUser({ name: 'Ibrahima Gestionnaire', email: 'distribution@demo.sn', role: 'distribution_manager', password: pass });
  await upsertUser({ name: 'Aminata Admin', email: 'admin2@demo.sn', role: 'admin', password: pass });
  const donor = await upsertUser({ name: 'Moussa Diop', email: 'moussa@demo.sn', role: 'user', password: pass });

  if (!(await Transaction.countDocuments())) {
    const types = ['zakat', 'zakat', 'sadaqa', 'zakat'];
    for (let i = 0; i < 8; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (i % 5));
      const tx = await Transaction.create({
        reference: makeReference('TX'), user: donor._id, amount: [25000, 50000, 100000, 75000][i % 4] * (1 + (i % 3)),
        type: types[i % 4], provider: ['wave', 'orange_money', 'card'][i % 3], status: 'confirmed', confirmedAt: date,
      });
      await Receipt.create({ number: makeReference('REC'), transaction: tx._id, user: donor._id,
        data: { reference: tx.reference, amount: tx.amount, currency: 'XOF', type: tx.type, provider: tx.provider, status: 'confirmed', date } });
    }
  }
  if (!(await AidRequest.countDocuments())) {
    const samples = [
      ['Fatou Ndiaye', 'sante', 'Dakar'], ['Cheikh Sow', 'alimentation', 'Thiès'], ['Mame Diarra Fall', 'education', 'Saint-Louis'],
    ];
    for (const [fullName, category, region] of samples) {
      await AidRequest.create({
        reference: makeReference('DOS'), applicant: donor._id, fullName, phone: '+221771234567', address: `${region}, Sénégal`,
        region, category, householdSize: 5, status: 'soumis', history: [{ status: 'soumis', by: donor._id }],
        description: 'Famille en difficulté depuis plusieurs mois, besoin d’un soutien ponctuel (données de démonstration).',
        documents: [],
      });
    }
  }
  console.log(`Comptes de démonstration (mot de passe : ${pass}) : agent@demo.sn, distribution@demo.sn, admin2@demo.sn, moussa@demo.sn`);
}

await mongoose.disconnect();
console.log('Seed terminé.');
