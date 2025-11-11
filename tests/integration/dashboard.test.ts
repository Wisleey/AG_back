/**
 * Testes de Integração - Dashboard
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { hashPassword } from '../../src/utils/passwordUtils';

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin_test_key';

describe('Dashboard API - Integration Tests', () => {
  let membro1Id: string;
  let membro2Id: string;

  beforeAll(async () => {
    // Limpar dados
    await prisma.obrigado.deleteMany();
    await prisma.indicacao.deleteMany();
    await prisma.membro.deleteMany();
    await prisma.usuario.deleteMany();

    const senhaHash = await hashPassword('SenhaForte123!');

    // Criar membros para testes
    const usuario1 = await prisma.usuario.create({
      data: {
        email: 'membro1@dashboard.com',
        nome: 'Membro 1',
        senhaHash,
        tipo: 'MEMBRO',
      },
    });

    const membro1 = await prisma.membro.create({
      data: {
        usuarioId: usuario1.id,
        nomeCompleto: 'Membro 1',
        email: 'membro1@dashboard.com',
        telefone: '11111111111',
        empresa: 'Empresa 1',
        status: 'ATIVO',
      },
    });
    membro1Id = membro1.id;

    const usuario2 = await prisma.usuario.create({
      data: {
        email: 'membro2@dashboard.com',
        nome: 'Membro 2',
        senhaHash,
        tipo: 'MEMBRO',
      },
    });

    const membro2 = await prisma.membro.create({
      data: {
        usuarioId: usuario2.id,
        nomeCompleto: 'Membro 2',
        email: 'membro2@dashboard.com',
        telefone: '22222222222',
        empresa: 'Empresa 2',
        status: 'ATIVO',
      },
    });
    membro2Id = membro2.id;

    // Criar indicações
    await prisma.indicacao.createMany({
      data: [
        {
          membroIndicadorId: membro1Id,
          membroIndicadoId: membro2Id,
          titulo: 'Indicação Aberta',
          descricao: 'Teste',
          cliente: 'Cliente 1',
          status: 'ABERTA',
          dataIndicacao: new Date(),
        },
        {
          membroIndicadorId: membro1Id,
          membroIndicadoId: membro2Id,
          titulo: 'Indicação Em Andamento',
          descricao: 'Teste',
          cliente: 'Cliente 2',
          status: 'EM_ANDAMENTO',
          dataIndicacao: new Date(),
        },
        {
          membroIndicadorId: membro2Id,
          membroIndicadoId: membro1Id,
          titulo: 'Indicação Fechada',
          descricao: 'Teste',
          cliente: 'Cliente 3',
          status: 'FECHADA',
          valorFechado: 10000,
          dataIndicacao: new Date(),
          dataFechamento: new Date(),
        },
      ],
    });

    // Criar obrigados
    await prisma.obrigado.createMany({
      data: [
        {
          membroQueAgradece: membro1Id,
          membroAgradecido: membro2Id,
          mensagem: 'Obrigado pela indicação!',
          dataObrigado: new Date(),
        },
        {
          membroQueAgradece: membro2Id,
          membroAgradecido: membro1Id,
          mensagem: 'Muito obrigado!',
          dataObrigado: new Date(),
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.obrigado.deleteMany();
    await prisma.indicacao.deleteMany();
    await prisma.membro.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/dashboard', () => {
    it('deve retornar métricas do dashboard com admin key válida', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('x-admin-key', ADMIN_KEY)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('membros');
      expect(response.body.data).toHaveProperty('indicacoes');
      expect(response.body.data).toHaveProperty('indicacoesMesAtual');
      expect(response.body.data).toHaveProperty('obrigadosMesAtual');
      expect(response.body.data).toHaveProperty('topMembrosIndicadores');

      // Verificar estrutura de membros
      expect(response.body.data.membros).toHaveProperty('total');
      expect(response.body.data.membros).toHaveProperty('ativos');
      expect(response.body.data.membros).toHaveProperty('inativos');

      // Verificar que tem 2 membros ativos
      expect(response.body.data.membros.total).toBe(2);
      expect(response.body.data.membros.ativos).toBe(2);

      // Verificar estrutura de indicações
      expect(response.body.data.indicacoes).toHaveProperty('total');
      expect(response.body.data.indicacoes).toHaveProperty('abertas');
      expect(response.body.data.indicacoes).toHaveProperty('emAndamento');
      expect(response.body.data.indicacoes).toHaveProperty('fechadas');
      expect(response.body.data.indicacoes).toHaveProperty('taxaConversao');
      expect(response.body.data.indicacoes).toHaveProperty('valorTotalGerado');

      // Verificar quantidades
      expect(response.body.data.indicacoes.total).toBe(3);
      expect(response.body.data.indicacoes.abertas).toBe(1);
      expect(response.body.data.indicacoes.emAndamento).toBe(1);
      expect(response.body.data.indicacoes.fechadas).toBe(1);
      expect(response.body.data.indicacoes.valorTotalGerado).toBe(10000);

      // Verificar indicações do mês
      expect(response.body.data.indicacoesMesAtual).toBe(3);

      // Verificar obrigados do mês
      expect(response.body.data.obrigadosMesAtual).toBe(2);

      // Verificar top membros
      expect(Array.isArray(response.body.data.topMembrosIndicadores)).toBe(true);
    });

    it('deve retornar 401 sem admin key', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Chave de admin não fornecida');
    });

    it('deve retornar 401 com admin key inválida', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('x-admin-key', 'chave-invalida')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Chave de admin inválida');
    });
  });

  describe('GET /api/dashboard/indicacoes/grafico', () => {
    it('deve retornar dados para gráficos com admin key válida', async () => {
      const response = await request(app)
        .get('/api/dashboard/indicacoes/grafico')
        .set('x-admin-key', ADMIN_KEY)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('porStatus');
      expect(response.body.data).toHaveProperty('ultimos6Meses');

      // Verificar porStatus
      expect(Array.isArray(response.body.data.porStatus)).toBe(true);
      if (response.body.data.porStatus.length > 0) {
        expect(response.body.data.porStatus[0]).toHaveProperty('status');
        expect(response.body.data.porStatus[0]).toHaveProperty('quantidade');
      }

      // Verificar ultimos6Meses
      expect(Array.isArray(response.body.data.ultimos6Meses)).toBe(true);
      expect(response.body.data.ultimos6Meses).toHaveLength(6);
      
      response.body.data.ultimos6Meses.forEach((mes: any) => {
        expect(mes).toHaveProperty('mes');
        expect(mes).toHaveProperty('abertas');
        expect(mes).toHaveProperty('fechadas');
        expect(mes).toHaveProperty('perdidas');
        expect(typeof mes.mes).toBe('string');
        expect(typeof mes.abertas).toBe('number');
        expect(typeof mes.fechadas).toBe('number');
        expect(typeof mes.perdidas).toBe('number');
      });
    });

    it('deve retornar 401 sem autenticação', async () => {
      const response = await request(app)
        .get('/api/dashboard/indicacoes/grafico')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Métricas Específicas', () => {
    it('deve calcular taxa de conversão corretamente', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('x-admin-key', ADMIN_KEY)
        .expect(200);

      const { taxaConversao, fechadas } = response.body.data.indicacoes;

      // Com 1 fechada e 0 perdidas, taxa deve ser 100%
      expect(fechadas).toBe(1);
      expect(taxaConversao).toBe(100);
    });

    it('deve retornar top membros ordenados por quantidade de indicações', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('x-admin-key', ADMIN_KEY)
        .expect(200);

      const topMembros = response.body.data.topMembrosIndicadores;

      expect(Array.isArray(topMembros)).toBe(true);

      if (topMembros.length > 1) {
        // Verificar que está ordenado decrescente
        for (let i = 0; i < topMembros.length - 1; i++) {
          expect(topMembros[i].totalIndicacoes).toBeGreaterThanOrEqual(
            topMembros[i + 1].totalIndicacoes
          );
        }
      }

      // Verificar estrutura
      topMembros.forEach((item: any) => {
        expect(item).toHaveProperty('membro');
        expect(item).toHaveProperty('totalIndicacoes');
        expect(item.membro).toHaveProperty('id');
        expect(item.membro).toHaveProperty('nomeCompleto');
        expect(typeof item.totalIndicacoes).toBe('number');
      });
    });

    it('deve contar apenas obrigados do mês atual', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('x-admin-key', ADMIN_KEY)
        .expect(200);

      // Devem haver 2 obrigados criados no beforeAll
      expect(response.body.data.obrigadosMesAtual).toBe(2);
    });
  });
});


