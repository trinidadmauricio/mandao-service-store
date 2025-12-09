/**
 * Servicio para órdenes del customer
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import type { ApiResponse, Order } from '@/types/api';

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const orderService = {
  /**
   * Listar órdenes del customer
   */
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrdersResponse> {
    const response = await apiClient.get<ApiResponse<OrdersResponse>>(
      endpoints.customer.orders,
      { params }
    );
    return response.data.data;
  },

  /**
   * Obtener orden por ID
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(
      endpoints.customer.order(orderId)
    );
    return response.data.data;
  },
};

