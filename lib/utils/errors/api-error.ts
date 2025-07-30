/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(
    message: string,
    code: string = 'API_ERROR',
    details?: any,
    statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Create an ApiError from a Response object
   */
  static async fromResponse(response: Response): Promise<ApiError> {
    let errorData: any = {};
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: 'An error occurred' };
    }

    const message = errorData.error?.message || errorData.message || 'An error occurred';
    const code = errorData.error?.code || errorData.code || 'API_ERROR';
    const details = errorData.error?.details || errorData.details;

    return new ApiError(message, code, details, response.status);
  }

  /**
   * Convert to a plain object for serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }

  /**
   * Check if error is a specific type
   */
  is(code: string): boolean {
    return this.code === code;
  }

  /**
   * Common error factory methods
   */
  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, 'UNAUTHORIZED', null, 401);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(message, 'FORBIDDEN', null, 403);
  }

  static notFound(message = 'Not found'): ApiError {
    return new ApiError(message, 'NOT_FOUND', null, 404);
  }

  static validation(message = 'Validation failed', details?: any): ApiError {
    return new ApiError(message, 'VALIDATION_ERROR', details, 400);
  }

  static conflict(message = 'Conflict', details?: any): ApiError {
    return new ApiError(message, 'CONFLICT', details, 409);
  }

  static rateLimit(message = 'Too many requests'): ApiError {
    return new ApiError(message, 'RATE_LIMIT', null, 429);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(message, 'INTERNAL_ERROR', null, 500);
  }
}