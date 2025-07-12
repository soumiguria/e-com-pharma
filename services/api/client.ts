// services/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, ApiError } from './types';

// API Configuration
const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.passkidukaan.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// HTTP Methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request Options
interface RequestOptions {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
}

// Response wrapper
interface ApiClientResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    this.retryAttempts = API_CONFIG.retryAttempts;
    this.retryDelay = API_CONFIG.retryDelay;
  }

  // Get auth token from storage
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Set auth token in storage
  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Clear auth token from storage
  private async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  // Build URL with query parameters
  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    if (!params) return fullURL;

    const urlObj = new URL(fullURL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value));
      }
    });

    return urlObj.toString();
  }

  // Get default headers
  private async getDefaultHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle API errors
  private handleApiError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        code: data?.code || `HTTP_${status}`,
        message: data?.message || `HTTP Error ${status}`,
        details: data?.details || { status, data },
      };
    } else if (error.request) {
      // Network error
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred. Please check your connection.',
        details: { request: error.request },
      };
    } else {
      // Other error
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        details: { error },
      };
    }
  }

  // Retry mechanism
  private async retryRequest<T>(
    requestFn: () => Promise<ApiClientResponse<T>>,
    attempt: number = 1
  ): Promise<ApiClientResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  // Check if request should be retried
  private shouldRetry(error: any): boolean {
    if (error.response) {
      const status = error.response.status;
      // Retry on 5xx server errors and 429 (rate limit)
      return status >= 500 || status === 429;
    }
    // Retry on network errors
    return !error.response && error.request;
  }

  // Delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main request method
  async request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
    const {
      method,
      url,
      data,
      params,
      headers: customHeaders,
      timeout = this.timeout,
      retry = true,
    } = options;

          const requestFn = async (): Promise<ApiClientResponse<T>> => {
        const fullURL = this.buildURL(url, params);
        const defaultHeaders = await this.getDefaultHeaders();
        const requestHeaders = { ...defaultHeaders, ...customHeaders };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(fullURL, {
            method,
            headers: requestHeaders,
            body: data ? JSON.stringify(data) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Handle HTTP errors
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw {
              response: {
                status: response.status,
                data: errorData,
              },
            };
          }

          // Handle successful response
          const responseData = await response.json();
          
          // Handle token refresh if needed
          if (response.headers.get('x-new-token')) {
            await this.setAuthToken(response.headers.get('x-new-token')!);
          }

          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((value: string, key: string) => {
            responseHeaders[key] = value;
          });

          return {
            data: responseData,
            status: response.status,
            headers: responseHeaders,
          };
        } catch (error: any) {
          clearTimeout(timeoutId);
          
          // Handle abort error (timeout)
          if (error.name === 'AbortError') {
            throw {
              code: 'TIMEOUT_ERROR',
              message: 'Request timeout',
              details: { timeout },
            };
          }
          
          throw error;
        }
      };

    try {
      const response = retry 
        ? await this.retryRequest(requestFn)
        : await requestFn();

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const apiError = this.handleApiError(error);
      
      // Handle authentication errors
      if (apiError.code === 'UNAUTHORIZED' || apiError.code === 'TOKEN_EXPIRED') {
        await this.clearAuthToken();
        // You might want to trigger a logout or redirect to login
      }

      return {
        success: false,
        error: apiError.message,
        data: null as any,
      };
    }
  }

  // Convenience methods
  async get<T>(url: string, params?: Record<string, any>, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      ...options,
    });
  }

  async post<T>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...options,
    });
  }

  async put<T>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...options,
    });
  }

  async patch<T>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...options,
    });
  }

  async delete<T>(url: string, options?: Partial<RequestOptions>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...options,
    });
  }

  // Upload file method
  async uploadFile<T>(
    url: string,
    file: { uri: string; type: string; name: string },
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers,
    });
  }

  // Download file method
  async downloadFile(url: string, filename?: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // For React Native, you might want to use react-native-fs or expo-file-system
      // This is a placeholder implementation
      return {
        success: true,
        filePath: filename || 'downloaded_file',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for convenience
export default apiClient; 