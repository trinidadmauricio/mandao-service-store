/**
 * Servicio para endpoints de customer
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import type { ApiResponse, User, CustomerAddress } from '@/types/api';

export interface UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export const customerService = {
  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(endpoints.customer.profile);
    return response.data.data;
  },

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(data: UpdateProfileDto): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(
      endpoints.customer.updateProfile,
      data
    );
    return response.data.data;
  },
};

