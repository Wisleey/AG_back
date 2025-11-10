/**
 * Middleware de autenticação JWT
 */

import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken } from '../utils/tokenUtils';
import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tipo: string;
  };
}

/**
 * Middleware para verificar token JWT
 */
export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw ApiError.unauthorized('Token não fornecido');
    }

    const decoded = verifyJwtToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    next(ApiError.unauthorized('Token inválido ou expirado'));
  }
};

/**
 * Middleware para verificar permissões (RBAC)
 */
export const rbacMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Não autenticado'));
    }

    if (!allowedRoles.includes(req.user.tipo)) {
      return next(ApiError.forbidden('Sem permissão para acessar este recurso'));
    }

    next();
  };
};


