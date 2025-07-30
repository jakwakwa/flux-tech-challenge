import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ProgressBarProvider } from "@/components/progress-bar-provider";
import { ErrorBoundaryProvider } from "@/components/providers/error-boundary-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Todo List App - Organize Your Tasks",
	description:
		"A simple and intuitive todo list application to organize your tasks and boost productivity.",
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
						<ErrorBoundaryProvider>
							<ProgressBarProvider />
							<ToastProvider />
							<ModalProvider />
							{children}
						</ErrorBoundaryProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
