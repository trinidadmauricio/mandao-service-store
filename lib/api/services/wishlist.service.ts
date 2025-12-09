/**
 * Servicio para wishlist del customer
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import type { ApiResponse, StorefrontProduct } from '@/types/api';

export interface WishlistItemResponse {
  id: string;
  product_id: string;
  variant_id?: string | null;
  product: StorefrontProduct;
  created_at: string;
}

export const wishlistService = {
  /**
   * Listar items de wishlist
   */
  async getWishlist(): Promise<WishlistItemResponse[]> {
    const response = await apiClient.get<ApiResponse<WishlistItemResponse[]>>(
      endpoints.wishlist.list
    );
    return response.data.data;
  },

  /**
   * Agregar producto a wishlist
   */
  async addToWishlist(productId: string, variantId?: string): Promise<WishlistItemResponse> {
    const response = await apiClient.post<ApiResponse<WishlistItemResponse>>(
      endpoints.wishlist.add,
      { product_id: productId, variant_id: variantId }
    );
    return response.data.data;
  },

  /**
   * Remover producto de wishlist
   */
  async removeFromWishlist(productId: string, variantId?: string): Promise<void> {
    await apiClient.delete(endpoints.wishlist.remove(productId, variantId));
  },
};

