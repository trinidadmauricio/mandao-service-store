/**
 * Servicio para pagos con Stripe
 */

import { apiClient } from '../client';
import type { ApiResponse } from '@/types/api';

export interface CreateStripeCheckoutRequest {
  order_id: string;
  tenant_id: string;
  success_url: string;
  cancel_url: string;
}

export interface CreateStripeCheckoutResponse {
  checkout_url: string;
  payment_intent_id: string | null;
}

export const paymentService = {
  /**
   * Crear sesión de checkout con Stripe
   */
  async createCheckout(data: CreateStripeCheckoutRequest): Promise<CreateStripeCheckoutResponse> {
    const response = await apiClient.post<ApiResponse<CreateStripeCheckoutResponse>>(
      '/api/v1/payments/checkout',
      data
    );
    return response.data.data;
  },
};

