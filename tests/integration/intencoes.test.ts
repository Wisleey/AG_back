/**
 * Testes de integração das rotas de intenções
 */

import request from 'supertest';
import app from '../../src/app';

describe('Rotas de Intenções - Integração', () => {
  describe('POST /api/intencoes', () => {
    it('deve criar uma nova intenção com sucesso', async () => {
      const novaIntencao = {
        nome: 'João Silva',
        email: 'joao.integration@teste.com',
        telefone: '11999998888',
        empresa: 'Empresa Teste',
        cargo: 'CEO',
        areaAtuacao: 'Tecnologia',
        mensagem: 'Quero participar do networking',
      };

      const response = await request(app)
        .post('/api/intencoes')
        .send(novaIntencao)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('PENDENTE');
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const intencaoInvalida = {
        nome: 'Jo', // Nome muito curto
        email: 'email-invalido',
        telefone: '123', // Telefone muito curto
      };

      const response = await request(app)
        .post('/api/intencoes')
        .send(intencaoInvalida)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('GET /api/intencoes/admin', () => {
    it('deve retornar erro 401 sem admin key', async () => {
      await request(app)
        .get('/api/intencoes/admin')
        .expect(401);
    });

    it('deve retornar erro 403 com admin key inválida', async () => {
      await request(app)
        .get('/api/intencoes/admin')
        .set('x-admin-key', 'chave-invalida')
        .expect(403);
    });

    it('deve listar intenções com admin key válida', async () => {
      const response = await request(app)
        .get('/api/intencoes/admin')
        .set('x-admin-key', process.env.ADMIN_KEY || 'admin_super_secret_key_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/health', () => {
    it('deve retornar status de saúde da API', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});




