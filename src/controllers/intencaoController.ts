/**
 * Controller para rotas de intenções
 */

import { Request, Response, NextFunction } from 'express';
import { intencaoService } from '../services/intencaoService';
import { ApiResponse } from '../utils/ApiResponse';
import type {
  CriarIntencaoInput,
  AprovarIntencaoInput,
  RejeitarIntencaoInput,
} from '../validators/intencaoValidator';

export class IntencaoController {
  /**
   * POST /api/intencoes
   * Criar nova intenção (público)
   */
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CriarIntencaoInput = req.body;

      const intencao = await intencaoService.criar(data);

      res.status(201).json(
        ApiResponse.success(
          {
            id: intencao.id,
            status: intencao.status,
          },
          'Sua intenção foi registrada com sucesso! Aguarde nossa avaliação.'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/intencoes
   * Listar intenções (admin)
   */
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as any;
      const search = req.query.search as string;

      const { intencoes, pagination } = await intencaoService.listar({
        page,
        limit,
        status,
        search,
      });

      res.json(ApiResponse.successWithPagination(intencoes, pagination));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/intencoes/:id
   * Buscar intenção por ID
   */
  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const intencao = await intencaoService.buscarPorId(id);

      res.json(ApiResponse.success(intencao));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/intencoes/:id/aprovar
   * Aprovar intenção
   */
  async aprovar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: AprovarIntencaoInput = req.body;
      const aprovadoPor = 'admin'; // Em produção, pegar do usuário autenticado

      const { intencao, tokenConvite } = await intencaoService.aprovar(
        id,
        aprovadoPor,
        data
      );

      // Gerar link de convite
      const linkConvite = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cadastro/${tokenConvite}`;

      res.json(
        ApiResponse.success(
          {
            intencao: {
              id: intencao.id,
              nome: intencao.nome,
              email: intencao.email,
              status: intencao.status,
            },
            tokenConvite,
            linkConvite,
          },
          'Intenção aprovada com sucesso!'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/intencoes/:id/rejeitar
   * Rejeitar intenção
   */
  async rejeitar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: RejeitarIntencaoInput = req.body;
      const aprovadoPor = 'admin'; // Em produção, pegar do usuário autenticado

      const intencao = await intencaoService.rejeitar(id, aprovadoPor, data);

      res.json(
        ApiResponse.success(
          {
            id: intencao.id,
            status: intencao.status,
          },
          'Intenção rejeitada'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/intencoes/token/:token
   * Buscar intenção por token (para validação no cadastro)
   */
  async buscarPorToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;

      const intencao = await intencaoService.buscarPorToken(token);

      res.json(
        ApiResponse.success({
          nome: intencao.nome,
          email: intencao.email,
          empresa: intencao.empresa,
          cargo: intencao.cargo,
          areaAtuacao: intencao.areaAtuacao,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/intencoes/estatisticas
   * Estatísticas de intenções
   */
  async estatisticas(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await intencaoService.contarPorStatus();
      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  }
}

export const intencaoController = new IntencaoController();


