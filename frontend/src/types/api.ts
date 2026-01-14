/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  page: number;
  limit: number;
  total: number;
}
