/**
 * Testes Unitários - DashboardService
 */

import { DashboardService } from '../../../src/services/dashboardService';
import prisma from '../../../src/config/database';
import { StatusIndicacao } from '@prisma/client';

// Mock do Prisma
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    membro: {
      count: jest.fn(),
    },
    indicacao: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    obrigado: {
      count: jest.fn(),
    },
  },
}));

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    service = new DashboardService();
    jest.clearAllMocks();
  });

  describe('obterMetricas', () => {
    it('deve retornar métricas gerais do dashboard', async () => {
      // Mock de todas as contagens
      (prisma.membro.count as jest.Mock)
        .mockResolvedValueOnce(10) // total membros
        .mockResolvedValueOnce(8); // membros ativos

      (prisma.indicacao.count as jest.Mock)
        .mockResolvedValueOnce(20) // total indicações
        .mockResolvedValueOnce(5)  // abertas
        .mockResolvedValueOnce(10) // em andamento
        .mockResolvedValueOnce(3)  // fechadas
        .mockResolvedValueOnce(2); // perdidas (para taxa conversão)

      (prisma.indicacao.aggregate as jest.Mock).mockResolvedValue({
        _sum: { valorFechado: 50000 },
      });

      const resultado = await service.obterMetricas();

      expect(resultado).toEqual({
        membros: {
          total: 10,
          ativos: 8,
          inativos: 2,
        },
        indicacoes: {
          total: 20,
          abertas: 5,
          emAndamento: 10,
          fechadas: 3,
          taxaConversao: 60, // 3/(3+2) * 100 = 60%
          valorTotalGerado: 50000,
        },
      });
    });

    it('deve calcular taxa de conversão zero quando não há indicações finalizadas', async () => {
      (prisma.membro.count as jest.Mock)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(5);

      (prisma.indicacao.count as jest.Mock)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0); // perdidas

      (prisma.indicacao.aggregate as jest.Mock).mockResolvedValue({
        _sum: { valorFechado: null },
      });

      const resultado = await service.obterMetricas();

      expect(resultado.indicacoes.taxaConversao).toBe(0);
      expect(resultado.indicacoes.valorTotalGerado).toBe(0);
    });
  });

  describe('indicacoesMesAtual', () => {
    it('deve retornar número de indicações do mês atual', async () => {
      (prisma.indicacao.count as jest.Mock).mockResolvedValue(15);

      const resultado = await service.indicacoesMesAtual();

      expect(resultado).toBe(15);
      expect(prisma.indicacao.count).toHaveBeenCalledWith({
        where: {
          dataIndicacao: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it('deve usar data correta do início do mês', async () => {
      (prisma.indicacao.count as jest.Mock).mockResolvedValue(5);

      await service.indicacoesMesAtual();

      const callArgs = (prisma.indicacao.count as jest.Mock).mock.calls[0][0];
      const dataInicio = callArgs.where.dataIndicacao.gte;

      expect(dataInicio.getDate()).toBe(1);
      expect(dataInicio.getHours()).toBe(0);
      expect(dataInicio.getMinutes()).toBe(0);
    });
  });

  describe('obrigadosMesAtual', () => {
    it('deve retornar número de obrigados do mês atual', async () => {
      (prisma.obrigado.count as jest.Mock).mockResolvedValue(8);

      const resultado = await service.obrigadosMesAtual();

      expect(resultado).toBe(8);
      expect(prisma.obrigado.count).toHaveBeenCalledWith({
        where: {
          dataObrigado: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it('deve retornar zero quando não há obrigados no mês', async () => {
      (prisma.obrigado.count as jest.Mock).mockResolvedValue(0);

      const resultado = await service.obrigadosMesAtual();

      expect(resultado).toBe(0);
    });
  });

  describe('topMembrosIndicacoes', () => {
    it('deve retornar top 5 membros com mais indicações', async () => {
      const mockGroupBy = [
        { membroIndicadorId: 'membro-1', _count: { id: 10 } },
        { membroIndicadorId: 'membro-2', _count: { id: 8 } },
        { membroIndicadorId: 'membro-3', _count: { id: 5 } },
      ];

      const mockMembros = [
        {
          id: 'membro-1',
          nomeCompleto: 'João Silva',
          empresa: 'Tech Corp',
          fotoUrl: 'foto1.jpg',
        },
        {
          id: 'membro-2',
          nomeCompleto: 'Maria Santos',
          empresa: 'Consultoria ABC',
          fotoUrl: 'foto2.jpg',
        },
        {
          id: 'membro-3',
          nomeCompleto: 'Pedro Costa',
          empresa: 'Marketing Pro',
          fotoUrl: null,
        },
      ];

      (prisma.indicacao.groupBy as jest.Mock).mockResolvedValue(mockGroupBy);
      
      // Mock findUnique para cada membro
      (prisma.membro as any).findUnique = jest.fn()
        .mockResolvedValueOnce(mockMembros[0])
        .mockResolvedValueOnce(mockMembros[1])
        .mockResolvedValueOnce(mockMembros[2]);

      const resultado = await service.topMembrosIndicacoes();

      expect(resultado).toHaveLength(3);
      expect(resultado[0]).toEqual({
        membro: mockMembros[0],
        totalIndicacoes: 10,
      });
      expect(resultado[1]).toEqual({
        membro: mockMembros[1],
        totalIndicacoes: 8,
      });
      expect(resultado[2]).toEqual({
        membro: mockMembros[2],
        totalIndicacoes: 5,
      });
    });

    it('deve limitar resultado a 5 membros', async () => {
      (prisma.indicacao.groupBy as jest.Mock).mockResolvedValue([]);

      await service.topMembrosIndicacoes();

      expect(prisma.indicacao.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });

  describe('indicacoesPorStatus', () => {
    it('deve retornar contagem de indicações por status', async () => {
      const mockResultado = [
        { status: StatusIndicacao.ABERTA, _count: { id: 5 } },
        { status: StatusIndicacao.EM_ANDAMENTO, _count: { id: 10 } },
        { status: StatusIndicacao.FECHADA, _count: { id: 3 } },
        { status: StatusIndicacao.PERDIDA, _count: { id: 2 } },
      ];

      (prisma.indicacao.groupBy as jest.Mock).mockResolvedValue(mockResultado);

      const resultado = await service.indicacoesPorStatus();

      expect(resultado).toEqual([
        { status: StatusIndicacao.ABERTA, quantidade: 5 },
        { status: StatusIndicacao.EM_ANDAMENTO, quantidade: 10 },
        { status: StatusIndicacao.FECHADA, quantidade: 3 },
        { status: StatusIndicacao.PERDIDA, quantidade: 2 },
      ]);
    });

    it('deve retornar array vazio quando não há indicações', async () => {
      (prisma.indicacao.groupBy as jest.Mock).mockResolvedValue([]);

      const resultado = await service.indicacoesPorStatus();

      expect(resultado).toEqual([]);
    });
  });

  describe('indicacoesUltimos6Meses', () => {
    it('deve retornar dados dos últimos 6 meses', async () => {
      (prisma.indicacao.count as jest.Mock)
        .mockResolvedValueOnce(2)  // abertas mês 1
        .mockResolvedValueOnce(3)  // fechadas mês 1
        .mockResolvedValueOnce(1)  // perdidas mês 1
        .mockResolvedValueOnce(4)  // abertas mês 2
        .mockResolvedValueOnce(5)  // fechadas mês 2
        .mockResolvedValueOnce(2); // perdidas mês 2

      const resultado = await service.indicacoesUltimos6Meses();

      expect(resultado).toHaveLength(6);
      expect(resultado[0]).toHaveProperty('mes');
      expect(resultado[0]).toHaveProperty('abertas');
      expect(resultado[0]).toHaveProperty('fechadas');
      expect(resultado[0]).toHaveProperty('perdidas');
    });

    it('deve formatar mês corretamente', async () => {
      // Mock para retornar zeros
      (prisma.indicacao.count as jest.Mock).mockResolvedValue(0);

      const resultado = await service.indicacoesUltimos6Meses();

      // Verificar que todos os meses estão formatados
      resultado.forEach((item) => {
        expect(typeof item.mes).toBe('string');
        expect(item.mes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('topMembrosIndicacoesRecebidas', () => {
    it('deve retornar top 5 membros que mais receberam indicações', async () => {
      const mockGroupBy = [
        { membroIndicadoId: 'membro-1', _count: { id: 12 } },
        { membroIndicadoId: 'membro-2', _count: { id: 9 } },
      ];

      const mockMembros = [
        {
          id: 'membro-1',
          nomeCompleto: 'Ana Costa',
          empresa: 'Design Studio',
          fotoUrl: 'foto1.jpg',
        },
        {
          id: 'membro-2',
          nomeCompleto: 'Carlos Mendes',
          empresa: 'Advocacia',
          fotoUrl: null,
        },
      ];

      (prisma.indicacao.groupBy as jest.Mock).mockResolvedValue(mockGroupBy);
      
      (prisma.membro as any).findUnique = jest.fn()
        .mockResolvedValueOnce(mockMembros[0])
        .mockResolvedValueOnce(mockMembros[1]);

      const resultado = await service.topMembrosIndicacoesRecebidas();

      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual({
        membro: mockMembros[0],
        totalIndicacoes: 12,
      });
    });

    it('deve ordenar por quantidade decrescente', async () => {
      (prisma.indicacao.groupBy as jest.Mock).mockResolvedValue([]);

      await service.topMembrosIndicacoesRecebidas();

      expect(prisma.indicacao.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
        })
      );
    });
  });
});

