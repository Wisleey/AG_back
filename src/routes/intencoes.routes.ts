/**
 * Rotas de intenções
 */

import { Router } from 'express';
import { intencaoController } from '../controllers/intencaoController';
import { adminAuth } from '../middlewares/adminAuth';
import { validateRequest } from '../middlewares/validateRequest';
import {
  criarIntencaoSchema,
  aprovarIntencaoSchema,
  rejeitarIntencaoSchema,
  buscarPorTokenSchema,
} from '../validators/intencaoValidator';

const router = Router();

// Rotas públicas
router.post(
  '/',
  validateRequest(criarIntencaoSchema),
  intencaoController.criar
);

router.get(
  '/token/:token',
  validateRequest(buscarPorTokenSchema),
  intencaoController.buscarPorToken
);

// Rotas administrativas (protegidas por ADMIN_KEY)
router.get('/admin', adminAuth, intencaoController.listar);

router.get('/admin/:id', adminAuth, intencaoController.buscarPorId);

router.get('/admin/estatisticas/geral', adminAuth, intencaoController.estatisticas);

router.put(
  '/admin/:id/aprovar',
  adminAuth,
  validateRequest(aprovarIntencaoSchema),
  intencaoController.aprovar
);

router.put(
  '/admin/:id/rejeitar',
  adminAuth,
  validateRequest(rejeitarIntencaoSchema),
  intencaoController.rejeitar
);

export default router;



