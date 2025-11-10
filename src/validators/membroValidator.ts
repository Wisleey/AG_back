/**
 * Validators para endpoints de membros
 */

import { z } from 'zod';

// Schema para cadastro completo via token
export const cadastroCompletoSchema = z.object({
  params: z.object({
    token: z.string().uuid('Token inválido'),
  }),
  body: z.object({
    senha: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    cargo: z.string().min(2).max(255).optional(),
    areaAtuacao: z.string().min(2).max(255).optional(),
    telefone: z.string().min(10).max(20).optional(),
    linkedin: z.string().url('URL do LinkedIn inválida').optional(),
    bio: z.string().max(1000).optional(),
    fotoUrl: z.string().url('URL da foto inválida').optional(),
  }),
});

export type CadastroCompletoInput = z.infer<typeof cadastroCompletoSchema>['body'];

