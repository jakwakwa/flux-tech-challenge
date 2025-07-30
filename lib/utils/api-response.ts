// @ts-nocheck
/** biome-ignore-all lint/complexity/noStaticOnlyClass: < Static class is needed for API response handling> */
import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type ApiError = {
	code: string;
	message: string;
	details?: unknown;
};

export type ApiSuccessResponse<T = unknown> = {
	success: true;
	data: T;
	meta?: {
		page?: number;
		limit?: number;
		total?: number;
		totalPages?: number;
	};
};

export type ApiErrorResponse = {
	success: false;
	error: ApiError;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Standardized API response handler for consistent response formatting
 * across all API endpoints.
 */
export class ApiResponseHandler {
	/**
	 * Creates a successful API response
	 * @param data - The data to include in the response
	 * @param meta - Optional metadata (pagination info, etc.)
	 * @returns NextResponse with standardized success format
	 */
	static success<T>(
		data: T,
		meta?: ApiSuccessResponse["meta"],
	): NextResponse<ApiSuccessResponse<T>> {
		return NextResponse.json({
			success: true,
			data,
			...(meta && { meta }),
		});
	}

	/**
	 * Creates an error API response
	 * @param message - Error message to display
	 * @param code - Error code for client-side handling
	 * @param status - HTTP status code
	 * @param details - Additional error details
	 * @returns NextResponse with standardized error format
	 */
	static error(
		message: string,
		code = "INTERNAL_ERROR",
		status = 500,
		details?: any,
	): NextResponse<ApiErrorResponse> {
		return NextResponse.json(
			{
				success: false,
				error: {
					code,
					message,
					...(details && { details }),
				},
			},
			{ status },
		);
	}

	/**
	 * Creates a validation error response from Zod errors
	 * @param error - ZodError instance
	 * @returns NextResponse with validation error details
	 */
	static validationError(error: ZodError): NextResponse<ApiErrorResponse> {
		return ApiResponseHandler.error(
			"Validation failed",
			"VALIDATION_ERROR",
			400,
			error.issues.map((err) => ({
				field: err.path.join("."),
				message: err.message,
			})),
		);
	}

	/**
	 * Creates an unauthorized error response
	 * @param message - Custom error message
	 * @returns NextResponse with 401 status
	 */
	static unauthorized(
		message = "Unauthorized",
	): NextResponse<ApiErrorResponse> {
		return ApiResponseHandler.error(message, "UNAUTHORIZED", 401);
	}

	/**
	 * Creates a not found error response
	 * @param resource - The resource that was not found
	 * @returns NextResponse with 404 status
	 */
	static notFound(resource: string): NextResponse<ApiErrorResponse> {
		return ApiResponseHandler.error(`${resource} not found`, "NOT_FOUND", 404);
	}

	/**
	 * Creates a forbidden error response
	 * @param message - Custom error message
	 * @returns NextResponse with 403 status
	 */
	static forbidden(message = "Forbidden"): NextResponse<ApiErrorResponse> {
		return ApiResponseHandler.error(message, "FORBIDDEN", 403);
	}

	/**
	 * Creates a bad request error response
	 * @param message - Error message explaining what was wrong with the request
	 * @returns NextResponse with 400 status
	 */
	static badRequest(message: string): NextResponse<ApiErrorResponse> {
		return ApiResponseHandler.error(message, "BAD_REQUEST", 400);
	}

	/**
	 * Creates a conflict error response
	 * @param message - Error message explaining the conflict
	 * @returns NextResponse with 409 status
	 */
	static conflict(message: string): NextResponse<ApiErrorResponse> {
		return ApiResponseHandler.error(message, "CONFLICT", 409);
	}
}
