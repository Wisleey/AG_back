/**
 * Testes unitários dos utilitários de token
 */

import {
  generateJwtToken,
  verifyJwtToken,
  generateInviteToken,
  isValidUuid,
} from '../../../src/utils/tokenUtils';

describe('TokenUtils', () => {
  describe('generateJwtToken', () => {
    it('deve gerar um token JWT válido', () => {
      const payload = {
        id: 'user-123',
        email: 'test@test.com',
        tipo: 'MEMBRO',
      };

      const token = generateJwtToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT tem 3 partes
    });
  });

  describe('verifyJwtToken', () => {
    it('deve verificar e decodificar um token válido', () => {
      const payload = {
        id: 'user-123',
        email: 'test@test.com',
        tipo: 'MEMBRO',
      };

      const token = generateJwtToken(payload);
      const decoded = verifyJwtToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.tipo).toBe(payload.tipo);
    });

    it('deve lançar erro para token inválido', () => {
      expect(() => {
        verifyJwtToken('token-invalido');
      }).toThrow();
    });
  });

  describe('generateInviteToken', () => {
    it('deve gerar um UUID v4 válido', () => {
      const token = generateInviteToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(isValidUuid(token)).toBe(true);
    });

    it('deve gerar tokens únicos', () => {
      const token1 = generateInviteToken();
      const token2 = generateInviteToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('isValidUuid', () => {
    it('deve validar UUID correto', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(isValidUuid(validUuid)).toBe(true);
    });

    it('deve invalidar string não-UUID', () => {
      expect(isValidUuid('not-a-uuid')).toBe(false);
      expect(isValidUuid('123')).toBe(false);
      expect(isValidUuid('')).toBe(false);
    });
  });
});



