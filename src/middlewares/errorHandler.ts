/**
 * Middleware global para tratamento de erros
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Erro operacional conhecido (ApiError)
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json(
      ApiResponse.error(
        error.statusCode === 400 ? 'VALIDATION_ERROR' :
        error.statusCode === 401 ? 'UNAUTHORIZED' :
        error.statusCode === 403 ? 'FORBIDDEN' :
        error.statusCode === 404 ? 'NOT_FOUND' :
        error.statusCode === 409 ? 'CONFLICT' :
        'INTERNAL_ERROR',
        error.message
      )
    );
  }

  // Erro de validação Zod
  if (error instanceof ZodError) {
    const details = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json(
      ApiResponse.error('VALIDATION_ERROR', 'Dados inválidos', details)
    );
  }

  // Erro do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.join(', ') || 'campo';
      return res.status(409).json(
        ApiResponse.error('CONFLICT', `${field} já está em uso`)
      );
    }

    // Record not found
    if (error.code === 'P2025') {
      return res.status(404).json(
        ApiResponse.error('NOT_FOUND', 'Registro não encontrado')
      );
    }
  }

  // Erro JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiResponse.error('UNAUTHORIZED', 'Token inválido')
    );
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiResponse.error('UNAUTHORIZED', 'Token expirado')
    );
  }

  // Log do erro para debug
  console.error('❌ Erro não tratado:', error);

  // Erro genérico do servidor
  return res.status(500).json(
    ApiResponse.error(
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Erro interno do servidor'
    )
  );
}

