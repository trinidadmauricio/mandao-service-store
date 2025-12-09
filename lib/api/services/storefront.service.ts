/**
 * Servicio para endpoints públicos del storefront
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import type {
  ApiResponse,
  StorefrontConfig,
  StorefrontProduct,
  StorefrontProductDetail,
  StorefrontCategory,
  StorefrontCategoryDetail,
  StorefrontBrand,
} from '@/types/api';

export const storefrontService = {
  /**
   * Obtener configuración del storefront
   */
  async getConfig(): Promise<StorefrontConfig> {
    const response = await apiClient.get<ApiResponse<StorefrontConfig>>(endpoints.storefront.config);
    return response.data.data;
  },

  /**
   * Listar productos del storefront
   */
  async getProducts(params?: {
    category_id?: string;
    brand_id?: string;
    page?: number;
    limit?: number;
    locale?: string;
    currency?: string;
  }): Promise<StorefrontProduct[]> {
    const response = await apiClient.get<ApiResponse<StorefrontProduct[]>>(
      endpoints.storefront.products,
      { params }
    );
    return response.data.data;
  },

  /**
   * Obtener producto por ID
   */
  async getProduct(
    id: string,
    params?: { locale?: string; currency?: string }
  ): Promise<StorefrontProductDetail> {
    const response = await apiClient.get<ApiResponse<StorefrontProductDetail>>(
      endpoints.storefront.product(id),
      { params }
    );
    return response.data.data;
  },

  /**
   * Listar categorías del storefront
   */
  async getCategories(params?: {
    include_children?: boolean;
  }): Promise<StorefrontCategory[]> {
    const response = await apiClient.get<ApiResponse<StorefrontCategory[]>>(
      endpoints.storefront.categories,
      { params }
    );
    return response.data.data;
  },

  /**
   * Obtener categoría por slug
   */
  async getCategoryBySlug(slug: string): Promise<StorefrontCategoryDetail> {
    const response = await apiClient.get<ApiResponse<StorefrontCategoryDetail>>(
      endpoints.storefront.category(slug)
    );
    return response.data.data;
  },

  /**
   * Listar marcas del storefront
   */
  async getBrands(): Promise<StorefrontBrand[]> {
    const response = await apiClient.get<ApiResponse<StorefrontBrand[]>>(
      endpoints.storefront.brands
    );
    return response.data.data;
  },
};

