/**
 * Rotas do dashboard
 */

import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { adminAuth } from '../middlewares/adminAuth';

const router = Router();

// Todas as rotas protegidas por admin
router.get('/', adminAuth, dashboardController.metricas);

router.get('/indicacoes/grafico', adminAuth, dashboardController.graficoIndicacoes);

export default router;


