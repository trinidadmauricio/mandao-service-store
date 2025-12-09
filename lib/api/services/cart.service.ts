/**
 * Servicio para endpoints del carrito
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import type { ApiResponse, Cart, CartItem } from '@/types/api';

export interface AddCartItemDto {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export const cartService = {
  /**
   * Obtener carrito del usuario/guest
   */
  async getCart(): Promise<Cart | null> {
    const response = await apiClient.get<ApiResponse<Cart | null>>(endpoints.cart.get);
    return response.data.data;
  },

  /**
   * Agregar item al carrito
   */
  async addItem(item: AddCartItemDto): Promise<Cart> {
    const response = await apiClient.post<ApiResponse<Cart>>(endpoints.cart.addItem, item);
    return response.data.data;
  },

  /**
   * Actualizar item del carrito
   */
  async updateItem(itemId: string, data: UpdateCartItemDto): Promise<Cart> {
    const response = await apiClient.put<ApiResponse<Cart>>(
      endpoints.cart.updateItem(itemId),
      data
    );
    return response.data.data;
  },

  /**
   * Remover item del carrito
   */
  async removeItem(itemId: string): Promise<Cart> {
    const response = await apiClient.delete<ApiResponse<Cart>>(endpoints.cart.removeItem(itemId));
    return response.data.data;
  },

  /**
   * Limpiar carrito
   */
  async clearCart(): Promise<void> {
    await apiClient.delete(endpoints.cart.clear);
  },
};

