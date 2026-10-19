import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { authRouter } from './modules/auth/auth.routes.js';

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const clientDirectory = path.resolve(here, '../../client');

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'style-src': ["'self'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    },
  },
}));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

app.use('/api', (req, res, next) => {
  const origin = req.get('origin');
  const expectedOrigin = `${req.protocol}://${req.get('host')}`;
  if (origin && origin !== expectedOrigin) return res.status(403).json({ error: 'Origem da solicitação não permitida.' });
  return next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use(express.static(clientDirectory, { extensions: ['html'] }));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Ocorreu um erro interno. Tente novamente.' });
});

export default app;
