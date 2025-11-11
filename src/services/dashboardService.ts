/**
 * Service para métricas e dados do dashboard
 */

import { StatusMembro, StatusIndicacao } from '@prisma/client';
import prisma from '../config/database';

export class DashboardService {
  /**
   * Obter métricas gerais do dashboard
   */
  async obterMetricas() {
    const [
      totalMembros,
      membrosAtivos,
      totalIndicacoes,
      indicacoesAbertas,
      indicacoesEmAndamento,
      indicacoesFechadas,
      valorTotalGerado,
    ] = await Promise.all([
      // Membros
      prisma.membro.count(),
      prisma.membro.count({ where: { status: StatusMembro.ATIVO } }),

      // Indicações
      prisma.indicacao.count(),
      prisma.indicacao.count({ where: { status: StatusIndicacao.ABERTA } }),
      prisma.indicacao.count({ where: { status: StatusIndicacao.EM_ANDAMENTO } }),
      prisma.indicacao.count({ where: { status: StatusIndicacao.FECHADA } }),

      // Valor total gerado
      prisma.indicacao.aggregate({
        where: { status: StatusIndicacao.FECHADA },
        _sum: { valorFechado: true },
      }),
    ]);

    // Calcular taxa de conversão
    const totalIndicacoesFinalizadas = indicacoesFechadas + 
      await prisma.indicacao.count({ where: { status: StatusIndicacao.PERDIDA } });
    
    const taxaConversao = totalIndicacoesFinalizadas > 0
      ? (indicacoesFechadas / totalIndicacoesFinalizadas) * 100
      : 0;

    return {
      membros: {
        total: totalMembros,
        ativos: membrosAtivos,
        inativos: totalMembros - membrosAtivos,
      },
      indicacoes: {
        total: totalIndicacoes,
        abertas: indicacoesAbertas,
        emAndamento: indicacoesEmAndamento,
        fechadas: indicacoesFechadas,
        taxaConversao: Math.round(taxaConversao * 100) / 100,
        valorTotalGerado: Number(valorTotalGerado._sum.valorFechado || 0),
      },
    };
  }

  /**
   * Indicações do mês atual
   */
  async indicacoesMesAtual() {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const totalIndicacoesMes = await prisma.indicacao.count({
      where: {
        dataIndicacao: {
          gte: inicioMes,
        },
      },
    });

    return totalIndicacoesMes;
  }

  /**
   * Obrigados registrados no mês atual
   */
  async obrigadosMesAtual() {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const totalObrigadosMes = await prisma.obrigado.count({
      where: {
        dataObrigado: {
          gte: inicioMes,
        },
      },
    });

    return totalObrigadosMes;
  }

  /**
   * Top 5 membros com mais indicações
   */
  async topMembrosIndicacoes() {
    const resultado = await prisma.indicacao.groupBy({
      by: ['membroIndicadorId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Buscar dados dos membros
    const membrosComCount = await Promise.all(
      resultado.map(async (item) => {
        const membro = await prisma.membro.findUnique({
          where: { id: item.membroIndicadorId },
          select: {
            id: true,
            nomeCompleto: true,
            empresa: true,
            fotoUrl: true,
          },
        });

        return {
          membro,
          totalIndicacoes: item._count.id,
        };
      })
    );

    return membrosComCount;
  }

  /**
   * Indicações por status (para gráfico)
   */
  async indicacoesPorStatus() {
    const resultado = await prisma.indicacao.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return resultado.map((item) => ({
      status: item.status,
      quantidade: item._count.id,
    }));
  }

  /**
   * Indicações dos últimos 6 meses (para gráfico)
   */
  async indicacoesUltimos6Meses() {
    const meses = [];
    const hoje = new Date();

    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 1);

      const [abertas, fechadas, perdidas] = await Promise.all([
        prisma.indicacao.count({
          where: {
            dataIndicacao: { gte: data, lt: proximoMes },
            status: StatusIndicacao.ABERTA,
          },
        }),
        prisma.indicacao.count({
          where: {
            dataIndicacao: { gte: data, lt: proximoMes },
            status: StatusIndicacao.FECHADA,
          },
        }),
        prisma.indicacao.count({
          where: {
            dataIndicacao: { gte: data, lt: proximoMes },
            status: StatusIndicacao.PERDIDA,
          },
        }),
      ]);

      meses.push({
        mes: data.toLocaleString('pt-BR', { month: 'short' }),
        abertas,
        fechadas,
        perdidas,
      });
    }

    return meses;
  }

  /**
   * Membros que mais receberam indicações
   */
  async topMembrosIndicacoesRecebidas() {
    const resultado = await prisma.indicacao.groupBy({
      by: ['membroIndicadoId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const membrosComCount = await Promise.all(
      resultado.map(async (item) => {
        const membro = await prisma.membro.findUnique({
          where: { id: item.membroIndicadoId },
          select: {
            id: true,
            nomeCompleto: true,
            empresa: true,
            fotoUrl: true,
          },
        });

        return {
          membro,
          totalIndicacoes: item._count.id,
        };
      })
    );

    return membrosComCount;
  }
}

export const dashboardService = new DashboardService();


