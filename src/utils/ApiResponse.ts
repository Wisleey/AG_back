/**
 * Classe para padronizar respostas da API
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ApiResponse {
  /**
   * Resposta de sucesso
   */
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      ...(message && { message }),
    };
  }

  /**
   * Resposta de sucesso com paginação
   */
  static successWithPagination<T>(
    data: T[],
    pagination: PaginationMeta,
    message?: string
  ) {
    return {
      success: true,
      data,
      pagination,
      ...(message && { message }),
    };
  }

  /**
   * Resposta de erro
   */
  static error(code: string, message: string, details?: any) {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    };
  }

  /**
   * Calcula metadados de paginação
   */
  static calculatePagination(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}

