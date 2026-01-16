import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import {
  ErrorCode,
  ApiError,
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../../shared/types/api";

// Re-export types for convenience
export { ErrorCode, ApiError, ApiErrorResponse, ApiSuccessResponse };

export class ApiResponse {
  static success<T>(
    res: Response,
    statusCode: number,
    data: T,
    message?: string
  ): void {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
    };
    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: Array<{ field: string; message: string }>
  ): void {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    };
    res.status(statusCode).json(response);
  }

  static validationError(res: Response, zodError: ZodError): void {
    const details = zodError.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    this.error(
      res,
      StatusCodes.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
      "Validation failed",
      details
    );
  }

  static notFound(res: Response, message: string = "Resource not found"): void {
    this.error(res, StatusCodes.NOT_FOUND, ErrorCode.NOT_FOUND, message);
  }

  static unauthorized(
    res: Response,
    message: string = "Authentication required"
  ): void {
    this.error(res, StatusCodes.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, message);
  }

  static forbidden(
    res: Response,
    message: string = "Access denied"
  ): void {
    this.error(res, StatusCodes.FORBIDDEN, ErrorCode.FORBIDDEN, message);
  }

  static conflict(res: Response, message: string): void {
    this.error(res, StatusCodes.CONFLICT, ErrorCode.CONFLICT, message);
  }

  static internalError(
    res: Response,
    message: string = "Internal server error"
  ): void {
    this.error(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR,
      message
    );
  }
}
