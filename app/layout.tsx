import {
	ClerkProvider,
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Next.js and Clerk Starter Kit",
	description: "The fastest way to build apps with Next.js and Clerk",
};

const geistSans = Geist({
	variable: "--font-geist-sans",
	display: "swap",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body className={`${geistSans.className} antialiased`}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<header className="p-4 border-b">
							<div className="flex justify-between items-center">
								<h1 className="text-xl font-bold">My App</h1>
								<div className="flex items-center gap-4">
									<SignedOut>
										<SignInButton />
										<SignUpButton />
									</SignedOut>
									<SignedIn>
										<UserButton />
									</SignedIn>
								</div>
							</div>
						</header>
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
