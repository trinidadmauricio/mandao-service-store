/**
 * Cliente Axios configurado para la API de Mandao
 * Incluye interceptors para JWT, refresh token y tenant
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: Agregar JWT, tenant y session
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Solo enviar token si existe y no está vacío
        const token = Cookies.get("access_token");
        if (token && token.trim() && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Tenant ID desde cookie o contexto
        const tenantId = Cookies.get("tenant_id");
        if (tenantId && config.headers) {
          config.headers["X-Tenant-Id"] = tenantId;
        }

        // Session ID para guests (carrito) - generar si no existe
        let sessionId = Cookies.get("session_id");
        if (!sessionId) {
          // Generar session_id para guests si no existe
          sessionId = this.generateSessionId();
          Cookies.set("session_id", sessionId, { expires: 365, path: "/" });
        }
        if (sessionId && config.headers) {
          config.headers["X-Session-Id"] = sessionId;
        }

        // Locale y currency
        const locale = Cookies.get("locale") || "es";
        const currency = Cookies.get("currency") || "USD";
        if (config.headers) {
          config.headers["Accept-Language"] = locale;
          config.headers["Accept-Currency"] = currency;
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
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Manejar 401: Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Identificar si es un endpoint público del storefront
          const isPublicStorefrontEndpoint =
            originalRequest.url?.includes("/api/v1/storefront/") ||
            originalRequest.url?.includes("/api/v1/cart");

          // Para endpoints públicos del storefront, si hay token inválido,
          // intentar la petición sin token (el backend los permite sin auth)
          if (isPublicStorefrontEndpoint) {
            originalRequest._retry = true;

            // Remover token inválido y reintentar sin autenticación
            if (originalRequest.headers) {
              delete originalRequest.headers.Authorization;
            }

            try {
              return this.client(originalRequest);
            } catch (retryError) {
              // Si aún falla, continuar con el flujo normal de refresh
            }
          }

          // Para TODOS los endpoints (públicos y protegidos), intentar refresh token
          // Esto mantiene el comportamiento original para backoffice y otros clientes
          originalRequest._retry = true;

          try {
            const refreshToken = Cookies.get("refresh_token");
            if (refreshToken) {
              const response = await axios.post(
                `${API_BASE_URL}/api/v1/auth/refresh`,
                { refresh_token: refreshToken },
                { withCredentials: true }
              );

              const { access_token } = response.data.data;
              Cookies.set("access_token", access_token, {
                expires: 7,
                path: "/",
              });

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Si el refresh falla, manejar según el tipo de endpoint
            if (isPublicStorefrontEndpoint) {
              // Para endpoints públicos, limpiar token inválido y reintentar sin auth
              Cookies.remove("access_token");
              Cookies.remove("refresh_token");
              if (originalRequest.headers) {
                delete originalRequest.headers.Authorization;
              }
              try {
                return this.client(originalRequest);
              } catch (retryError) {
                // Si aún falla, rechazar el error original
                return Promise.reject(error);
              }
            }

            // Para endpoints protegidos (backoffice, wishlist, etc.):
            // Limpiar cookies y rechazar el error (comportamiento original)
            // NO redirigir automáticamente, dejar que cada aplicación maneje el error
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            Cookies.remove("user");
            // Mantener tenant_id y session_id para continuidad de navegación en storefront

            return Promise.reject(error);
          }

          // Si no hay refresh token, rechazar el error
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Generar un session ID único para guests
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
  }

  public getInstance(): AxiosInstance {
    return this.client;
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
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

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();
export default apiClient.getInstance();
