/**
 * Servicio para endpoints de autenticación
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import type { ApiResponse, LoginResponse, RegisterResponse, User } from '@/types/api';
import Cookies from 'js-cookie';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
  tenant_id?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginDto): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      endpoints.auth.login,
      credentials
    );
    const data = response.data.data;

    // Guardar tokens en cookies
    Cookies.set('access_token', data.access_token, { expires: 7, path: '/' });
    if (data.user) {
      Cookies.set('user', JSON.stringify(data.user), { expires: 7, path: '/' });
    }

    return data;
  },

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterDto): Promise<RegisterResponse> {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>(
      endpoints.auth.register,
      data
    );
    return response.data.data;
  },

  /**
   * Solicitar reset de contraseña
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    await apiClient.post(endpoints.auth.forgotPassword, data);
  },

  /**
   * Resetear contraseña
   */
  async resetPassword(data: ResetPasswordDto): Promise<void> {
    await apiClient.post(endpoints.auth.resetPassword, data);
  },

  /**
   * Verificar email
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post(endpoints.auth.verifyEmail, { token });
  },

  /**
   * Cerrar sesión
   */
  logout(): void {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('tenant_id');
    Cookies.remove('user');
    Cookies.remove('session_id');
  },

  /**
   * Obtener usuario actual desde cookies
   */
  getCurrentUser(): User | null {
    const userStr = Cookies.get('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  },
};

