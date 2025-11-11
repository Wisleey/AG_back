/**
 * Rotas de membros
 */

import { Router } from 'express';
import { membroController } from '../controllers/membroController';
import { adminAuth } from '../middlewares/adminAuth';
import { validateRequest } from '../middlewares/validateRequest';
import { cadastroCompletoSchema } from '../validators/membroValidator';

const router = Router();

// Rota pública - cadastro via token
router.post(
  '/cadastro/:token',
  validateRequest(cadastroCompletoSchema),
  membroController.cadastroCompleto
);

// Rotas administrativas
router.get('/', adminAuth, membroController.listar);

router.get('/estatisticas', adminAuth, membroController.estatisticas);

router.get('/:id', adminAuth, membroController.buscarPorId);

router.put('/:id', adminAuth, membroController.atualizar);

export default router;



