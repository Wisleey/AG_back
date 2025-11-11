/**
 * Testes Unitários - MembroService
 */

import { MembroService } from '../../../src/services/membroService';
import prisma from '../../../src/config/database';
import { hashPassword } from '../../../src/utils/passwordUtils';
import { StatusMembro, TipoUsuario } from '@prisma/client';

// Mock do Prisma
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    intencao: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    membro: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock do hashPassword
jest.mock('../../../src/utils/passwordUtils', () => ({
  hashPassword: jest.fn(),
}));

describe('MembroService', () => {
  let service: MembroService;

  beforeEach(() => {
    service = new MembroService();
    jest.clearAllMocks();
  });

  describe('cadastroCompleto', () => {
    const mockToken = 'token-valido-123';
    const mockData = {
      senha: 'Senha123!',
      telefone: '11987654321',
      cargo: 'CEO',
      areaAtuacao: 'Tecnologia',
      linkedin: 'https://linkedin.com/in/teste',
      bio: 'Minha bio',
      fotoUrl: 'https://exemplo.com/foto.jpg',
    };

    const mockIntencao = {
      id: '1',
      nome: 'João Silva',
      email: 'joao@teste.com',
      telefone: '11987654321',
      empresa: 'Tech Corp',
      cargo: 'Gerente',
      areaAtuacao: 'TI',
      status: 'APROVADO' as const,
      tokenConvite: mockToken,
      dataIntencao: new Date(),
      aprovadoPor: null,
      dataAvaliacao: null,
      motivoRejeicao: null,
      mensagem: null,
    };

    const mockUsuario = {
      id: 'usuario-1',
      email: 'joao@teste.com',
      nome: 'João Silva',
      senhaHash: 'hash-senha',
      tipo: TipoUsuario.MEMBRO,
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const mockMembro = {
      id: 'membro-1',
      usuarioId: 'usuario-1',
      nomeCompleto: 'João Silva',
      email: 'joao@teste.com',
      telefone: '11987654321',
      empresa: 'Tech Corp',
      cargo: 'CEO',
      areaAtuacao: 'Tecnologia',
      linkedin: 'https://linkedin.com/in/teste',
      bio: 'Minha bio',
      fotoUrl: 'https://exemplo.com/foto.jpg',
      status: StatusMembro.ATIVO,
      dataEntrada: new Date(),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    it('deve cadastrar membro com sucesso quando token é válido', async () => {
      (prisma.intencao.findUnique as jest.Mock).mockResolvedValue(mockIntencao);
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hash-senha');
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          usuario: { create: jest.fn().mockResolvedValue(mockUsuario) },
          membro: { create: jest.fn().mockResolvedValue(mockMembro) },
          intencao: { update: jest.fn().mockResolvedValue(mockIntencao) },
        });
      });

      const resultado = await service.cadastroCompleto(mockToken, mockData);

      expect(prisma.intencao.findUnique).toHaveBeenCalledWith({
        where: { tokenConvite: mockToken },
      });
      expect(hashPassword).toHaveBeenCalledWith(mockData.senha);
      expect(resultado).toHaveProperty('usuario');
      expect(resultado).toHaveProperty('membro');
    });

    it('deve lançar erro quando token não existe', async () => {
      (prisma.intencao.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.cadastroCompleto(mockToken, mockData)).rejects.toThrow(
        'Token de convite inválido'
      );
    });

    it('deve lançar erro quando intenção não foi aprovada', async () => {
      const intencaoPendente = { ...mockIntencao, status: 'PENDENTE' as const };
      (prisma.intencao.findUnique as jest.Mock).mockResolvedValue(intencaoPendente);

      await expect(service.cadastroCompleto(mockToken, mockData)).rejects.toThrow(
        'Esta intenção não foi aprovada'
      );
    });

    it('deve lançar erro quando email já está cadastrado', async () => {
      (prisma.intencao.findUnique as jest.Mock).mockResolvedValue(mockIntencao);
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUsuario);

      await expect(service.cadastroCompleto(mockToken, mockData)).rejects.toThrow(
        'Já existe um cadastro com este email'
      );
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar membro quando ID existe', async () => {
      const mockMembro = {
        id: '1',
        usuarioId: 'usuario-1',
        nomeCompleto: 'João Silva',
        email: 'joao@teste.com',
        telefone: '11987654321',
        empresa: 'Tech Corp',
        cargo: 'CEO',
        areaAtuacao: 'Tecnologia',
        linkedin: null,
        bio: null,
        fotoUrl: null,
        status: StatusMembro.ATIVO,
        dataEntrada: new Date(),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        usuario: {
          id: 'usuario-1',
          email: 'joao@teste.com',
          nome: 'João Silva',
          senhaHash: 'hash',
          tipo: TipoUsuario.MEMBRO,
          ativo: true,
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      };

      (prisma.membro.findUnique as jest.Mock).mockResolvedValue(mockMembro);

      const resultado = await service.buscarPorId('1');

      expect(prisma.membro.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { usuario: true },
      });
      expect(resultado).toEqual(mockMembro);
    });

    it('deve lançar erro quando membro não existe', async () => {
      (prisma.membro.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.buscarPorId('id-inexistente')).rejects.toThrow(
        'Membro não encontrado'
      );
    });
  });

  describe('buscarPorUsuarioId', () => {
    it('deve retornar membro quando usuário existe', async () => {
      const mockMembro = {
        id: '1',
        usuarioId: 'usuario-1',
        nomeCompleto: 'João Silva',
        usuario: {
          id: 'usuario-1',
          email: 'joao@teste.com',
          nome: 'João Silva',
        },
      };

      (prisma.membro.findUnique as jest.Mock).mockResolvedValue(mockMembro);

      const resultado = await service.buscarPorUsuarioId('usuario-1');

      expect(prisma.membro.findUnique).toHaveBeenCalledWith({
        where: { usuarioId: 'usuario-1' },
        include: { usuario: true },
      });
      expect(resultado).toEqual(mockMembro);
    });

    it('deve retornar null quando usuário não tem membro', async () => {
      (prisma.membro.findUnique as jest.Mock).mockResolvedValue(null);

      const resultado = await service.buscarPorUsuarioId('usuario-inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('listar', () => {
    it('deve listar membros com paginação', async () => {
      const mockMembros = [
        { id: '1', nomeCompleto: 'João' },
        { id: '2', nomeCompleto: 'Maria' },
      ];

      (prisma.membro.findMany as jest.Mock).mockResolvedValue(mockMembros);
      (prisma.membro.count as jest.Mock).mockResolvedValue(10);

      const resultado = await service.listar({
        page: 1,
        limit: 10,
      });

      expect(resultado.membros).toEqual(mockMembros);
      expect(resultado.total).toBe(10);
    });

    it('deve filtrar por status', async () => {
      (prisma.membro.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.membro.count as jest.Mock).mockResolvedValue(0);

      await service.listar({
        page: 1,
        limit: 10,
        status: StatusMembro.ATIVO,
      });

      expect(prisma.membro.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: StatusMembro.ATIVO },
        })
      );
    });

    it('deve buscar por termo de pesquisa', async () => {
      (prisma.membro.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.membro.count as jest.Mock).mockResolvedValue(0);

      await service.listar({
        page: 1,
        limit: 10,
        search: 'João',
      });

      expect(prisma.membro.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('contarPorStatus', () => {
    it('deve retornar contagem de membros por status', async () => {
      (prisma.membro.count as jest.Mock)
        .mockResolvedValueOnce(5) // ativos
        .mockResolvedValueOnce(2) // inativos
        .mockResolvedValueOnce(1) // pendentes
        .mockResolvedValueOnce(0); // suspensos

      const resultado = await service.contarPorStatus();

      expect(resultado).toEqual({
        ativos: 5,
        inativos: 2,
        pendentes: 1,
        suspensos: 0,
        total: 8,
      });
    });
  });

  describe('atualizar', () => {
    const mockMembroAtualizado = {
      id: '1',
      usuarioId: 'usuario-1',
      nomeCompleto: 'João Silva',
      cargo: 'CTO', // atualizado
      status: StatusMembro.ATIVO,
    };

    it('deve atualizar membro com sucesso', async () => {
      // Mock buscarPorId
      (prisma.membro.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        usuario: { id: 'usuario-1' },
      });

      (prisma.membro.update as jest.Mock).mockResolvedValue(mockMembroAtualizado);

      const resultado = await service.atualizar('1', { cargo: 'CTO' });

      expect(prisma.membro.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { cargo: 'CTO' },
      });
      expect(resultado.cargo).toBe('CTO');
    });

    it('deve lançar erro quando membro não existe', async () => {
      (prisma.membro.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.atualizar('id-inexistente', { cargo: 'CTO' })).rejects.toThrow(
        'Membro não encontrado'
      );
    });
  });
});

