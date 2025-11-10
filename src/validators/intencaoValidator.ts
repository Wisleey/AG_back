/**
 * Validators para endpoints de intenções
 */

import { z } from 'zod';

// Schema para criar intenção (público)
export const criarIntencaoSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
    email: z.string().email('Email inválido'),
    telefone: z.string().min(10, 'Telefone inválido').max(20),
    empresa: z.string().min(2, 'Nome da empresa é obrigatório').max(255),
    cargo: z.string().max(255).optional(),
    areaAtuacao: z.string().max(255).optional(),
    mensagem: z.string().max(1000).optional(),
  }),
});

// Schema para aprovar intenção
export const aprovarIntencaoSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    observacoes: z.string().max(500).optional(),
  }),
});

// Schema para rejeitar intenção
export const rejeitarIntencaoSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    motivo: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres').max(500),
  }),
});

// Schema para listar intenções
export const listarIntencoesSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
    status: z.enum(['PENDENTE', 'APROVADO', 'REJEITADO']).optional(),
    search: z.string().optional(),
  }),
});

// Schema para buscar por token
export const buscarPorTokenSchema = z.object({
  params: z.object({
    token: z.string().uuid('Token inválido'),
  }),
});

export type CriarIntencaoInput = z.infer<typeof criarIntencaoSchema>['body'];
export type AprovarIntencaoInput = z.infer<typeof aprovarIntencaoSchema>['body'];
export type RejeitarIntencaoInput = z.infer<typeof rejeitarIntencaoSchema>['body'];

