/**
 * Servicio para direcciones del customer
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import type { ApiResponse, CustomerAddress } from '@/types/api';

export interface CreateAddressDto {
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  street_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  lat?: number;
  lng?: number;
  instructions?: string;
  is_default?: boolean;
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {}

export const addressService = {
  /**
   * Listar direcciones del customer
   */
  async getAddresses(): Promise<CustomerAddress[]> {
    const response = await apiClient.get<ApiResponse<CustomerAddress[]>>(
      endpoints.customer.addresses
    );
    return response.data.data;
  },

  /**
   * Obtener dirección por ID
   */
  async getAddress(addressId: string): Promise<CustomerAddress> {
    const response = await apiClient.get<ApiResponse<CustomerAddress>>(
      endpoints.customer.address(addressId)
    );
    return response.data.data;
  },

  /**
   * Crear nueva dirección
   */
  async createAddress(data: CreateAddressDto): Promise<CustomerAddress> {
    const response = await apiClient.post<ApiResponse<CustomerAddress>>(
      endpoints.customer.addresses,
      data
    );
    return response.data.data;
  },

  /**
   * Actualizar dirección
   */
  async updateAddress(addressId: string, data: UpdateAddressDto): Promise<CustomerAddress> {
    const response = await apiClient.patch<ApiResponse<CustomerAddress>>(
      endpoints.customer.address(addressId),
      data
    );
    return response.data.data;
  },

  /**
   * Eliminar dirección
   */
  async deleteAddress(addressId: string): Promise<void> {
    await apiClient.delete(endpoints.customer.address(addressId));
  },
};

