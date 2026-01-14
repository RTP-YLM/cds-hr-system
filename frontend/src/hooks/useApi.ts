import { useState, useCallback } from 'react';
import type { ApiResponse, ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  execute: (...args: any[]) => Promise<T | null>;
}

/**
 * Custom Hook สำหรับเรียก API
 */
export function useApi<T = any>(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  url: string,
  options?: UseApiOptions
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (body?: any, queryParams?: Record<string, any>): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        let fullUrl = `${API_BASE_URL}${url}`;

        // เพิ่ม query parameters
        if (queryParams) {
          const params = new URLSearchParams();
          Object.keys(queryParams).forEach(key => {
            if (queryParams[key] !== undefined && queryParams[key] !== null) {
              params.append(key, String(queryParams[key]));
            }
          });
          const queryString = params.toString();
          if (queryString) {
            fullUrl += `?${queryString}`;
          }
        }

        const config: RequestInit = {
          method,
          headers: {
            ...(!(body instanceof FormData) && { 'Content-Type': 'application/json' }),
          },
        };

        if (body && method !== 'GET') {
          config.body = body instanceof FormData ? body : JSON.stringify(body);
        }

        const response = await fetch(fullUrl, config);
        const result: ApiResponse<T> = await response.json();

        if (!response.ok || !result.success) {
          const apiError: ApiError = {
            success: false,
            message: result.message || 'เกิดข้อผิดพลาด',
            errors: result.errors,
          };
          setError(apiError);
          options?.onError?.(apiError);
          return null;
        }

        setData(result.data || null);
        options?.onSuccess?.(result.data);
        return result.data || null;
      } catch (err: any) {
        const apiError: ApiError = {
          success: false,
          message: err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        };
        setError(apiError);
        options?.onError?.(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [method, url, options]
  );

  return { data, error, loading, execute };
}

/**
 * Shorthand hooks
 */
export function useGet<T = any>(url: string, options?: UseApiOptions) {
  return useApi<T>('GET', url, options);
}

export function usePost<T = any>(url: string, options?: UseApiOptions) {
  return useApi<T>('POST', url, options);
}

export function usePatch<T = any>(url: string, options?: UseApiOptions) {
  return useApi<T>('PATCH', url, options);
}

export function useDelete<T = any>(url: string, options?: UseApiOptions) {
  return useApi<T>('DELETE', url, options);
}
