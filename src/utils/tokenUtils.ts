/**
 * Utilitários para geração e validação de tokens
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

export interface JwtPayload {
  id: string;
  email: string;
  tipo: string;
}

/**
 * Gera um token JWT
 */
export function generateJwtToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyJwtToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
}

/**
 * Gera um token único de convite (UUID v4)
 */
export function generateInviteToken(): string {
  return uuidv4();
}

/**
 * Valida formato de UUID
 */
export function isValidUuid(token: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}

