// Error codes for API responses
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  CONFLICT = "CONFLICT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// Error structure
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// API response types
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

// Type guard to check if response is an error
export function isApiError(
  response: ApiSuccessResponse<unknown> | ApiErrorResponse
): response is ApiErrorResponse {
  return response.success === false;
}

// Entity types
export interface Item {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}
