/**
 * Router principal - Agrupa todas as rotas
 */

import { Router } from 'express';
import intencoesRoutes from './intencoes.routes';
import membrosRoutes from './membros.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Montar rotas
router.use('/intencoes', intencoesRoutes);
router.use('/membros', membrosRoutes);
router.use('/dashboard', dashboardRoutes);

// Rota de health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

export default router;


