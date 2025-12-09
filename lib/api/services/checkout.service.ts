/**
 * Servicio para checkout
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import type { ApiResponse } from '@/types/api';

export interface CheckoutRequest {
  tenant_id: string;
  items: Array<{
    product_id?: string;
    variant_id?: string;
    quantity: number;
  }>;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
  delivery_address: {
    street: string;
    city: string;
    state?: string;
    zip_code?: string;
    country: string;
    lat: number;
    lng: number;
  };
  pickup_address?: {
    street: string;
    city: string;
    state?: string;
    zip_code?: string;
    country: string;
    lat: number;
    lng: number;
  };
  branch_id: string;
  currency?: string;
  locale?: string;
  special_instructions?: string;
  scheduled_pickup_at?: string;
  estimated_delivery_at: string;
  priority?: 'NORMAL' | 'URGENT';
}

export interface CheckoutResponse {
  order_id: string;
  order_number: string;
  order_display_number: string;
  tracking_code: string;
  status: string;
  created_at: string;
}

export const checkoutService = {
  /**
   * Procesar checkout
   */
  async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post<ApiResponse<CheckoutResponse>>(
      endpoints.checkout.create,
      data
    );
    return response.data.data;
  },
};

