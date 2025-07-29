// lib/api-response.ts
import { NextResponse } from 'next/server';
import { AppError, AuthenticationError, NotFoundError, ValidationError, RateLimitError } from './errors';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    field?: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export class ApiResponseHandler {
  static success<T>(
    data: T,
    status: number = 200,
    meta?: ApiResponse['meta']
  ): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(meta && { meta }),
    };

    return NextResponse.json(response, { status });
  }

  static error(
    error: AppError | Error,
    status?: number
  ): NextResponse {
    const isAppError = error instanceof AppError;
    const statusCode = status || (isAppError ? error.statusCode : 500);
    
    const response: ApiResponse = {
      success: false,
      error: {
        message: error.message,
        ...(isAppError && { code: error.code }),
        ...(isAppError && error instanceof ValidationError && { 
          field: (error as any).field 
        }),
      },
    };

    return NextResponse.json(response, { status: statusCode });
  }

  static unauthorized(message: string = 'Authentication required'): NextResponse {
    return this.error(new AuthenticationError(message));
  }

  static notFound(resource: string = 'Resource'): NextResponse {
    return this.error(new NotFoundError(resource));
  }

  static validationError(message: string, field?: string): NextResponse {
    return this.error(new ValidationError(message, field));
  }

  static rateLimitExceeded(message: string): NextResponse {
    return this.error(new RateLimitError(message));
  }
}