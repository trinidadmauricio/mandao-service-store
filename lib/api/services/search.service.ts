/**
 * Servicio para búsqueda de productos
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import type { ApiResponse, SearchResult } from '@/types/api';

export const searchService = {
  /**
   * Buscar productos, categorías y marcas
   */
  async search(params: {
    q: string;
    limit?: number;
  }): Promise<SearchResult> {
    const response = await apiClient.get<ApiResponse<SearchResult>>(endpoints.storefront.search, {
      params: {
        q: params.q,
        limit: params.limit || 20,
      },
    });
    return response.data.data;
  },
};

