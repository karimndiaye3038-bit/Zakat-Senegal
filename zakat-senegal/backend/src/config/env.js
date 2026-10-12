import dotenv from 'dotenv';
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zakat_senegal',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  paymentMode: process.env.PAYMENT_MODE || 'sandbox',
  webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
};

export const isProd = env.nodeEnv === 'production';

// Garde-fous : les secrets ne doivent jamais rester par défaut en production.
if (isProd && env.paymentMode === 'sandbox' && process.env.ALLOW_SANDBOX_IN_PROD !== 'true') {
  throw new Error('PAYMENT_MODE=sandbox est interdit en production (démo : ALLOW_SANDBOX_IN_PROD=true).');
}