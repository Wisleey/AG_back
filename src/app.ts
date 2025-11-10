/**
 * Configuração do Express App
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// ============================================================================
// MIDDLEWARES GLOBAIS
// ============================================================================

// Segurança HTTP headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger HTTP
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================================
// ROTAS
// ============================================================================

// Rota raiz
app.get('/', (_req, res) => {
  res.json({
    message: '🚀 API de Gestão de Networking',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      intencoes: '/api/intencoes',
      membros: '/api/membros',
      dashboard: '/api/dashboard',
    },
  });
});

// Rotas da API
app.use('/api', routes);

// ============================================================================
// TRATAMENTO DE ERROS
// ============================================================================

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Rota ${req.method} ${req.path} não encontrada`,
    },
  });
});

// Error handler global
app.use(errorHandler);

export default app;


