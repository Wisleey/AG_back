/**
 * Testes unitários do IntencaoService
 */

import { intencaoService } from '../../../src/services/intencaoService';
import prisma from '../../../src/config/database';
import { ApiError } from '../../../src/utils/ApiError';
import { StatusIntencao } from '@prisma/client';

describe('IntencaoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criar', () => {
    it('deve criar uma nova intenção com sucesso', async () => {
      const mockIntencao = {
        id: 'uuid-123',
        nome: 'João Silva',
        email: 'joao@teste.com',
        telefone: '11999998888',
        empresa: 'Empresa Teste',
        cargo: 'CEO',
        areaAtuacao: 'Tecnologia',
        mensagem: 'Quero participar',
        status: StatusIntencao.PENDENTE,
        aprovadoPor: null,
        dataIntencao: new Date(),
        dataAvaliacao: null,
        motivoRejeicao: null,
        tokenConvite: null,
      };

      (prisma.intencao.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.intencao.create as jest.Mock).mockResolvedValue(mockIntencao);

      const resultado = await intencaoService.criar({
        nome: 'João Silva',
        email: 'joao@teste.com',
        telefone: '11999998888',
        empresa: 'Empresa Teste',
        cargo: 'CEO',
        areaAtuacao: 'Tecnologia',
        mensagem: 'Quero participar',
      });

      expect(resultado).toEqual(mockIntencao);
      expect(prisma.intencao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nome: 'João Silva',
          email: 'joao@teste.com',
          status: StatusIntencao.PENDENTE,
        }),
      });
    });

    it('deve lançar erro se email já existe', async () => {
      (prisma.intencao.findUnique as jest.Mock).mockResolvedValue({
        id: 'uuid-existing',
        email: 'joao@teste.com',
      });

      await expect(
        intencaoService.criar({
          nome: 'João Silva',
          email: 'joao@teste.com',
          telefone: '11999998888',
          empresa: 'Empresa Teste',
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('aprovar', () => {
    it('deve aprovar uma intenção e gerar token', async () => {
      const mockIntencao = {
        id: 'uuid-123',
        status: StatusIntencao.PENDENTE,
        email: 'joao@teste.com',
        nome: 'João Silva',
      };

      const mockIntencaoAprovada = {
        ...mockIntencao,
        status: StatusIntencao.APROVADO,
        tokenConvite: expect.any(String),
        dataAvaliacao: expect.any(Date),
      };

      (prisma.intencao.findUnique as jest.Mock).mockResolvedValue(mockIntencao);
      (prisma.intencao.update as jest.Mock).mockResolvedValue(mockIntencaoAprovada);

      const resultado = await intencaoService.aprovar('uuid-123', 'admin-id');

      expect(resultado.intencao.status).toBe(StatusIntencao.APROVADO);
      expect(resultado.tokenConvite).toBeDefined();
      expect(prisma.intencao.update).toHaveBeenCalled();
    });

    it('deve lançar erro se intenção já foi avaliada', async () => {
      (prisma.intencao.findUnique as jest.Mock).mockResolvedValue({
        id: 'uuid-123',
        status: StatusIntencao.APROVADO,
      });

      await expect(
        intencaoService.aprovar('uuid-123', 'admin-id')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('buscarPorToken', () => {
    it('deve retornar intenção válida pelo token', async () => {
      const mockIntencao = {
        id: 'uuid-123',
        tokenConvite: 'token-valid',
        status: StatusIntencao.APROVADO,
        nome: 'João Silva',
        email: 'joao@teste.com',
      };

      (prisma.intencao.findUnique as jest.Mock).mockResolvedValue(mockIntencao);

      const resultado = await intencaoService.buscarPorToken('token-valid');

      expect(resultado).toEqual(mockIntencao);
    });

    it('deve lançar erro se token inválido', async () => {
      (prisma.intencao.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        intencaoService.buscarPorToken('token-invalid')
      ).rejects.toThrow(ApiError);
    });
  });
});



