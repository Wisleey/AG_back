/**
 * Service para lógica de negócio de membros
 */

import { Membro, Usuario, Prisma, StatusMembro, TipoUsuario } from '@prisma/client';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { hashPassword } from '../utils/passwordUtils';
import type { CadastroCompletoInput } from '../validators/membroValidator';

export class MembroService {
  /**
   * Cadastro completo via token de convite
   */
  async cadastroCompleto(
    token: string,
    data: CadastroCompletoInput
  ): Promise<{ usuario: Usuario; membro: Membro }> {
    // Buscar intenção pelo token
    const intencao = await prisma.intencao.findUnique({
      where: { tokenConvite: token },
    });

    if (!intencao) {
      throw ApiError.notFound('Token de convite inválido');
    }

    if (intencao.status !== 'APROVADO') {
      throw ApiError.badRequest('Esta intenção não foi aprovada');
    }

    // Verificar se já existe usuário com este email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: intencao.email },
    });

    if (usuarioExistente) {
      throw ApiError.conflict('Já existe um cadastro com este email');
    }

    // Hash da senha
    const senhaHash = await hashPassword(data.senha);

    // Criar usuário e membro em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const usuario = await tx.usuario.create({
        data: {
          email: intencao.email,
          nome: intencao.nome,
          senhaHash,
          tipo: TipoUsuario.MEMBRO,
          ativo: true,
        },
      });

      // Criar membro
      const membro = await tx.membro.create({
        data: {
          usuarioId: usuario.id,
          nomeCompleto: intencao.nome,
          email: intencao.email,
          telefone: data.telefone || intencao.telefone,
          empresa: intencao.empresa,
          cargo: data.cargo || intencao.cargo,
          areaAtuacao: data.areaAtuacao || intencao.areaAtuacao,
          linkedin: data.linkedin,
          bio: data.bio,
          fotoUrl: data.fotoUrl,
          status: StatusMembro.ATIVO,
          dataEntrada: new Date(),
        },
      });

      // Invalidar token de convite (opcional - podemos deletar ou marcar como usado)
      await tx.intencao.update({
        where: { id: intencao.id },
        data: { tokenConvite: null },
      });

      return { usuario, membro };
    });

    return resultado;
  }

  /**
   * Buscar membro por ID
   */
  async buscarPorId(id: string): Promise<Membro & { usuario: Usuario }> {
    const membro = await prisma.membro.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!membro) {
      throw ApiError.notFound('Membro não encontrado');
    }

    return membro;
  }

  /**
   * Buscar membro por ID do usuário
   */
  async buscarPorUsuarioId(
    usuarioId: string
  ): Promise<(Membro & { usuario: Usuario }) | null> {
    return prisma.membro.findUnique({
      where: { usuarioId },
      include: { usuario: true },
    });
  }

  /**
   * Listar membros com paginação e filtros
   */
  async listar(params: {
    page: number;
    limit: number;
    status?: StatusMembro;
    search?: string;
  }) {
    const { page, limit, status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.MembroWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { nomeCompleto: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { empresa: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [membros, total] = await Promise.all([
      prisma.membro.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: 'desc' },
        include: {
          usuario: {
            select: {
              id: true,
              email: true,
              nome: true,
              tipo: true,
              ativo: true,
            },
          },
        },
      }),
      prisma.membro.count({ where }),
    ]);

    return { membros, total };
  }

  /**
   * Contar membros por status
   */
  async contarPorStatus() {
    const [ativos, inativos, pendentes, suspensos] = await Promise.all([
      prisma.membro.count({ where: { status: StatusMembro.ATIVO } }),
      prisma.membro.count({ where: { status: StatusMembro.INATIVO } }),
      prisma.membro.count({ where: { status: StatusMembro.PENDENTE } }),
      prisma.membro.count({ where: { status: StatusMembro.SUSPENSO } }),
    ]);

    return {
      ativos,
      inativos,
      pendentes,
      suspensos,
      total: ativos + inativos + pendentes + suspensos,
    };
  }

  /**
   * Atualizar membro
   */
  async atualizar(
    id: string,
    data: Partial<Omit<Membro, 'id' | 'usuarioId' | 'criadoEm'>>
  ): Promise<Membro> {
    // Verificar se membro existe
    await this.buscarPorId(id);

    return prisma.membro.update({
      where: { id },
      data,
    });
  }
}

export const membroService = new MembroService();




