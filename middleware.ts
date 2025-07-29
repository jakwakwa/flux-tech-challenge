import type { ClerkMiddlewareAuth } from "@clerk/nextjs/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Create route matchers to identify which routes require authentication
const isPublicRoute = createRouteMatcher(["/", "/sign-in", "/sign-up"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);
const isProtectedRoute = createRouteMatcher(["/dashboard", "/tasks(.*)"]);

/**
 * Clerk Middleware
 *
 * Protection Strategy:
 * 1. Public routes are accessible without authentication
 * 2. Protected routes require session authentication
 * 3. API routes require session authentication
 */
export default clerkMiddleware(
	async (auth: ClerkMiddlewareAuth, req: NextRequest) => {
		// If it's a public route, don't require authentication
		if (isPublicRoute(req)) {
			return;
		}

		// Protect API routes
		if (isApiRoute(req)) {
			await auth.protect();
		}

		// Protect dashboard and tasks routes
		if (isProtectedRoute(req)) {
			await auth.protect();
		}

		// For any other route, require authentication by default
		await auth.protect();
	},
);

export const config = {
	matcher: [
		// Simple matcher - exclude Next.js internals and static files
		"/((?!_next/static|_next/image|favicon.ico).*)",
		// Include API routes
		"/api/:path*",
	],
};
