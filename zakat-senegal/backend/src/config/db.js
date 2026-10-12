import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Connexion MongoDB impossible :', err.message);
    process.exit(1);
  }
}
