/**
 * Cliente Axios configurado para la API de Mandao
 * Incluye interceptors para JWT, refresh token y tenant
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Cliente Axios configurado para la API
 * Incluye interceptors para JWT, refresh token y tenant
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: Agregar JWT, tenant y session
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Tenant ID desde cookie o contexto
        const tenantId = Cookies.get('tenant_id');
        if (tenantId && config.headers) {
          config.headers['X-Tenant-Id'] = tenantId;
        }

        // Session ID para guests (carrito)
        const sessionId = Cookies.get('session_id');
        if (sessionId && config.headers) {
          config.headers['X-Session-Id'] = sessionId;
        }

        // Locale y currency
        const locale = Cookies.get('locale') || 'es';
        const currency = Cookies.get('currency') || 'USD';
        if (config.headers) {
          config.headers['Accept-Language'] = locale;
          config.headers['Accept-Currency'] = currency;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Manejar errores y refresh token
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = Cookies.get('refresh_token');
            if (refreshToken) {
              const response = await axios.post(
                `${API_BASE_URL}/api/v1/auth/refresh`,
                { refresh_token: refreshToken },
                { withCredentials: true }
              );

              const { access_token } = response.data.data;
              Cookies.set('access_token', access_token, { expires: 7, path: '/' });

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Limpiar cookies y redirigir a login
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            Cookies.remove('tenant_id');
            Cookies.remove('user');
            Cookies.remove('session_id');

            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public getInstance(): AxiosInstance {
    return this.client;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();
export default apiClient.getInstance();

