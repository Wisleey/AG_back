/**
 * Controller para rotas de membros
 */

import { Request, Response, NextFunction } from 'express';
import { membroService } from '../services/membroService';
import { ApiResponse } from '../utils/ApiResponse';
import type { CadastroCompletoInput } from '../validators/membroValidator';

export class MembroController {
  /**
   * POST /api/membros/cadastro/:token
   * Cadastro completo via token de convite
   */
  async cadastroCompleto(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const data: CadastroCompletoInput = req.body;

      const { usuario, membro } = await membroService.cadastroCompleto(token, data);

      res.status(201).json(
        ApiResponse.success(
          {
            usuario: {
              id: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
            },
            membro: {
              id: membro.id,
              nomeCompleto: membro.nomeCompleto,
              empresa: membro.empresa,
              status: membro.status,
            },
          },
          'Cadastro realizado com sucesso! Você já pode fazer login.'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/membros
   * Listar membros
   */
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as any;
      const search = req.query.search as string;

      const { membros, total } = await membroService.listar({
        page,
        limit,
        status,
        search,
      });

      const pagination = ApiResponse.calculatePagination(page, limit, total);

      res.json(ApiResponse.successWithPagination(membros, pagination));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/membros/:id
   * Buscar membro por ID
   */
  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const membro = await membroService.buscarPorId(id);

      res.json(ApiResponse.success(membro));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/membros/estatisticas
   * Estatísticas de membros
   */
  async estatisticas(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await membroService.contarPorStatus();
      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/membros/:id
   * Atualizar membro
   */
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      const membro = await membroService.atualizar(id, data);

      res.json(ApiResponse.success(membro, 'Membro atualizado com sucesso'));
    } catch (error) {
      next(error);
    }
  }
}

export const membroController = new MembroController();


