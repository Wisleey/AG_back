/**
 * Middleware para autenticação de administradores via ADMIN_KEY
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export function adminAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const adminKey = req.headers['x-admin-key'] as string;

    if (!adminKey) {
      throw ApiError.unauthorized('Chave de admin não fornecida');
    }

    if (adminKey !== env.ADMIN_KEY) {
      throw ApiError.forbidden('Chave de admin inválida');
    }

    next();
  } catch (error) {
    next(error);
  }
}

