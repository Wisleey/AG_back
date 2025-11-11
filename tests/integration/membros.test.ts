/**
 * Testes de Integração - Membros
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { hashPassword } from '../../src/utils/passwordUtils';

describe('Membros API - Integration Tests', () => {
  let tokenValido: string;
  let intencaoId: string;

  beforeAll(async () => {
    // Limpar dados de teste
    await prisma.membro.deleteMany();
    await prisma.intencao.deleteMany();
    await prisma.usuario.deleteMany();

    // Criar uma intenção aprovada com token
    const intencao = await prisma.intencao.create({
      data: {
        nome: 'Teste Membro',
        email: 'teste.membro@example.com',
        telefone: '11987654321',
        empresa: 'Empresa Teste',
        cargo: 'Gerente',
        areaAtuacao: 'TI',
        status: 'APROVADO',
        tokenConvite: 'token-teste-valido-123',
      },
    });

    tokenValido = intencao.tokenConvite!;
    intencaoId = intencao.id;
  });

  afterAll(async () => {
    // Limpar dados após os testes
    await prisma.membro.deleteMany();
    await prisma.intencao.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/membros/cadastro/:token', () => {
    it('deve cadastrar membro com sucesso usando token válido', async () => {
      const dadosCadastro = {
        senha: 'SenhaForte123!',
        telefone: '11987654321',
        cargo: 'CEO',
        areaAtuacao: 'Tecnologia',
        linkedin: 'https://linkedin.com/in/teste',
        bio: 'Minha biografia de teste',
        fotoUrl: 'https://exemplo.com/foto.jpg',
      };

      const response = await request(app)
        .post(`/api/membros/cadastro/${tokenValido}`)
        .send(dadosCadastro)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data).toHaveProperty('membro');
      expect(response.body.data.usuario.email).toBe('teste.membro@example.com');
      expect(response.body.data.membro.cargo).toBe('CEO');
      expect(response.body.data.membro.status).toBe('ATIVO');
    });

    it('deve retornar 404 para token inválido', async () => {
      const response = await request(app)
        .post('/api/membros/cadastro/token-invalido-xyz')
        .send({
          senha: 'SenhaForte123!',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Token de convite inválido');
    });

    it('deve retornar 400 para intenção não aprovada', async () => {
      // Criar intenção pendente
      const intencaoPendente = await prisma.intencao.create({
        data: {
          nome: 'Teste Pendente',
          email: 'pendente@example.com',
          telefone: '11999999999',
          empresa: 'Empresa',
          status: 'PENDENTE',
          tokenConvite: 'token-pendente-123',
        },
      });

      const response = await request(app)
        .post(`/api/membros/cadastro/${intencaoPendente.tokenConvite}`)
        .send({
          senha: 'SenhaForte123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('não foi aprovada');

      // Limpar
      await prisma.intencao.delete({ where: { id: intencaoPendente.id } });
    });

    it('deve retornar 400 para senha fraca', async () => {
      // Criar nova intenção para este teste
      const novaIntencao = await prisma.intencao.create({
        data: {
          nome: 'Teste Senha Fraca',
          email: 'senha.fraca@example.com',
          telefone: '11888888888',
          empresa: 'Empresa',
          status: 'APROVADO',
          tokenConvite: 'token-senha-fraca-123',
        },
      });

      const response = await request(app)
        .post(`/api/membros/cadastro/${novaIntencao.tokenConvite}`)
        .send({
          senha: '123', // Senha muito fraca
        })
        .expect(400);

      expect(response.body.success).toBe(false);

      // Limpar
      await prisma.intencao.delete({ where: { id: novaIntencao.id } });
    });
  });

  describe('GET /api/membros/:id', () => {
    let membroId: string;

    beforeAll(async () => {
      // Criar um membro para os testes
      const senhaHash = await hashPassword('SenhaForte123!');

      const usuario = await prisma.usuario.create({
        data: {
          email: 'membro.busca@example.com',
          nome: 'Membro Busca',
          senhaHash,
          tipo: 'MEMBRO',
        },
      });

      const membro = await prisma.membro.create({
        data: {
          usuarioId: usuario.id,
          nomeCompleto: 'Membro Busca',
          email: 'membro.busca@example.com',
          telefone: '11777777777',
          empresa: 'Empresa Busca',
          cargo: 'Analista',
          status: 'ATIVO',
        },
      });

      membroId = membro.id;
    });

    it('deve buscar membro por ID com sucesso', async () => {
      const response = await request(app)
        .get(`/api/membros/${membroId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(membroId);
      expect(response.body.data.nomeCompleto).toBe('Membro Busca');
      expect(response.body.data).toHaveProperty('usuario');
    });

    it('deve retornar 404 para membro inexistente', async () => {
      const response = await request(app)
        .get('/api/membros/id-inexistente-123')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('não encontrado');
    });
  });

  describe('PUT /api/membros/:id', () => {
    let membroId: string;

    beforeAll(async () => {
      const senhaHash = await hashPassword('SenhaForte123!');

      const usuario = await prisma.usuario.create({
        data: {
          email: 'membro.update@example.com',
          nome: 'Membro Update',
          senhaHash,
          tipo: 'MEMBRO',
        },
      });

      const membro = await prisma.membro.create({
        data: {
          usuarioId: usuario.id,
          nomeCompleto: 'Membro Update',
          email: 'membro.update@example.com',
          telefone: '11666666666',
          empresa: 'Empresa Update',
          cargo: 'Analista',
          status: 'ATIVO',
        },
      });

      membroId = membro.id;
    });

    it('deve atualizar membro com sucesso', async () => {
      const dadosAtualizacao = {
        cargo: 'Gerente',
        areaAtuacao: 'Marketing',
        linkedin: 'https://linkedin.com/in/atualizado',
      };

      const response = await request(app)
        .put(`/api/membros/${membroId}`)
        .send(dadosAtualizacao)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cargo).toBe('Gerente');
      expect(response.body.data.areaAtuacao).toBe('Marketing');
      expect(response.body.data.linkedin).toBe('https://linkedin.com/in/atualizado');
    });

    it('deve retornar 404 ao tentar atualizar membro inexistente', async () => {
      const response = await request(app)
        .put('/api/membros/id-inexistente-456')
        .send({ cargo: 'CEO' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});



