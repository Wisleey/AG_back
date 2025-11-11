/**
 * Controller para rotas do dashboard
 */

import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { ApiResponse } from '../utils/ApiResponse';

export class DashboardController {
  /**
   * GET /api/dashboard
   * Métricas gerais do dashboard
   */
  async metricas(_req: Request, res: Response, next: NextFunction) {
    try {
      const metricas = await dashboardService.obterMetricas();
      const indicacoesMes = await dashboardService.indicacoesMesAtual();
      const obrigadosMes = await dashboardService.obrigadosMesAtual();
      const topIndicadores = await dashboardService.topMembrosIndicacoes();
      const topIndicados = await dashboardService.topMembrosIndicacoesRecebidas();

      res.json(
        ApiResponse.success({
          ...metricas,
          indicacoesMesAtual: indicacoesMes,
          obrigadosMesAtual: obrigadosMes,
          topMembrosIndicadores: topIndicadores,
          topMembrosIndicados: topIndicados,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/indicacoes/grafico
   * Dados para gráfico de indicações
   */
  async graficoIndicacoes(_req: Request, res: Response, next: NextFunction) {
    try {
      const porStatus = await dashboardService.indicacoesPorStatus();
      const ultimos6Meses = await dashboardService.indicacoesUltimos6Meses();

      res.json(
        ApiResponse.success({
          porStatus,
          ultimos6Meses,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();


