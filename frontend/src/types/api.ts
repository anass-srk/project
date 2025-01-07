import { AxiosError } from 'axios';

export interface ApiError {
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export type ApiErrorResponse = AxiosError<ApiError>;