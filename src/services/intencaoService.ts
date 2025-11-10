/**
 * Service para lógica de negócio de intenções
 */

import { Intencao, Prisma, StatusIntencao } from '@prisma/client';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { generateInviteToken } from '../utils/tokenUtils';
import type {
  CriarIntencaoInput,
  AprovarIntencaoInput,
  RejeitarIntencaoInput,
} from '../validators/intencaoValidator';

export class IntencaoService {
  /**
   * Criar nova intenção (público)
   */
  async criar(data: CriarIntencaoInput): Promise<Intencao> {
    // Verificar se email já existe
    const intencaoExistente = await prisma.intencao.findUnique({
      where: { email: data.email },
    });

    if (intencaoExistente) {
      throw ApiError.conflict('Email já cadastrado');
    }

    // Criar intenção
    const intencao = await prisma.intencao.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        empresa: data.empresa,
        cargo: data.cargo,
        areaAtuacao: data.areaAtuacao,
        mensagem: data.mensagem,
        status: StatusIntencao.PENDENTE,
      },
    });

    return intencao;
  }

  /**
   * Listar intenções com paginação e filtros
   */
  async listar(params: {
    page: number;
    limit: number;
    status?: StatusIntencao;
    search?: string;
  }) {
    const { page, limit, status, search } = params;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: Prisma.IntencaoWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { empresa: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Buscar intenções e total
    const [intencoes, total] = await Promise.all([
      prisma.intencao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataIntencao: 'desc' },
      }),
      prisma.intencao.count({ where }),
    ]);

    const pagination = ApiResponse.calculatePagination(page, limit, total);

    return { intencoes, pagination };
  }

  /**
   * Buscar intenção por ID
   */
  async buscarPorId(id: string): Promise<Intencao> {
    const intencao = await prisma.intencao.findUnique({
      where: { id },
    });

    if (!intencao) {
      throw ApiError.notFound('Intenção não encontrada');
    }

    return intencao;
  }

  /**
   * Buscar intenção por token de convite
   */
  async buscarPorToken(token: string): Promise<Intencao> {
    const intencao = await prisma.intencao.findUnique({
      where: { tokenConvite: token },
    });

    if (!intencao) {
      throw ApiError.notFound('Token de convite inválido');
    }

    if (intencao.status !== StatusIntencao.APROVADO) {
      throw ApiError.badRequest('Esta intenção não foi aprovada');
    }

    return intencao;
  }

  /**
   * Aprovar intenção
   */
  async aprovar(
    id: string,
    aprovadoPor: string,
    _data?: AprovarIntencaoInput
  ): Promise<{ intencao: Intencao; tokenConvite: string }> {
    const intencao = await this.buscarPorId(id);

    if (intencao.status !== StatusIntencao.PENDENTE) {
      throw ApiError.badRequest('Esta intenção já foi avaliada');
    }

    // Gerar token de convite
    const tokenConvite = generateInviteToken();

    // Atualizar intenção
    const intencaoAtualizada = await prisma.intencao.update({
      where: { id },
      data: {
        status: StatusIntencao.APROVADO,
        aprovadoPor,
        dataAvaliacao: new Date(),
        tokenConvite,
      },
    });

    // TODO: Enviar email com link de convite
    // await emailService.enviarConvite(intencaoAtualizada.email, tokenConvite);

    return {
      intencao: intencaoAtualizada,
      tokenConvite,
    };
  }

  /**
   * Rejeitar intenção
   */
  async rejeitar(
    id: string,
    aprovadoPor: string,
    data: RejeitarIntencaoInput
  ): Promise<Intencao> {
    const intencao = await this.buscarPorId(id);

    if (intencao.status !== StatusIntencao.PENDENTE) {
      throw ApiError.badRequest('Esta intenção já foi avaliada');
    }

    // Atualizar intenção
    const intencaoAtualizada = await prisma.intencao.update({
      where: { id },
      data: {
        status: StatusIntencao.REJEITADO,
        aprovadoPor,
        dataAvaliacao: new Date(),
        motivoRejeicao: data.motivo,
      },
    });

    // TODO: Enviar email informando rejeição
    // await emailService.enviarRejeicao(intencaoAtualizada.email, data.motivo);

    return intencaoAtualizada;
  }

  /**
   * Contar intenções por status
   */
  async contarPorStatus() {
    const [pendentes, aprovadas, rejeitadas] = await Promise.all([
      prisma.intencao.count({ where: { status: StatusIntencao.PENDENTE } }),
      prisma.intencao.count({ where: { status: StatusIntencao.APROVADO } }),
      prisma.intencao.count({ where: { status: StatusIntencao.REJEITADO } }),
    ]);

    return {
      pendentes,
      aprovadas,
      rejeitadas,
      total: pendentes + aprovadas + rejeitadas,
    };
  }
}

export const intencaoService = new IntencaoService();

