/**
 * Setup global para testes
 */

// Mock do Prisma Client para testes
jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((callback) => callback({
      usuario: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      membro: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      intencao: {
        update: jest.fn(),
      },
    })),
    usuario: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    membro: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    intencao: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    indicacao: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

// Timeout global para testes
jest.setTimeout(10000);




