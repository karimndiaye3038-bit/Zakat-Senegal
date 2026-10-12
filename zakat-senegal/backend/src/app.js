import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { env, isProd } from './config/env.js';
import routes from './routes/index.js';
import { apiLimiter } from './middlewares/rateLimit.js';
import { notFound, errorHandler } from './middlewares/error.js';

const app = express();
if (isProd) app.set('trust proxy', 1); // derrière un reverse proxy (limitation par IP correcte)

app.use(helmet());
app.use(cors({ origin: env.clientUrl.split(',').map((s) => s.trim()) }));
app.use(compression());
if (!isProd) app.use(morgan('dev'));
// rawBody conservé pour vérifier la signature des webhooks de paiement.
app.use(express.json({ limit: '1mb', verify: (req, res, buf) => { req.rawBody = buf; } }));

app.use('/api', apiLimiter, routes);
app.use(notFound);
app.use(errorHandler);

export default app;
