import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
	"/dashboard(.*)",
	"/tasks(.*)",
	"/lists(.*)",
	"/profile(.*)",
	"/settings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();
	const isProtected = isProtectedRoute(req);

	// If user is not signed in and trying to access protected route
	if (!userId && isProtected) {
		return NextResponse.redirect(new URL("/sign-in", req.url));
	}

	// If user is signed in and trying to access root page, redirect to dashboard
	if (userId && req.nextUrl.pathname === "/") {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
