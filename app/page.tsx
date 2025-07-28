import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col items-center">
			<div className="flex-1 w-full flex flex-col gap-20 items-center">
				<nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
					<div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
						<div className="flex gap-5 items-center font-semibold">
							<Link href={"/"}>Next.js Clerk Starter</Link>
							<div className="flex items-center gap-2">deploy</div>
						</div>
						<ThemeSwitcher />
					</div>
				</nav>
				<div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
					<div className="flex-1 flex flex-col gap-6 px-4">
						<SignedOut>
							<div className="text-center">
								<h1 className="text-4xl font-bold mb-4">
									Welcome to Clerk Auth
								</h1>
								<p className="text-lg text-muted-foreground mb-8">
									Sign in or sign up to get started with your account.
								</p>
							</div>
						</SignedOut>
						<SignedIn>
							<div className="text-center">
								<h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
								<p className="text-lg text-muted-foreground mb-8">
									You're successfully signed in with Clerk.
								</p>
								<div className="bg-card p-6 rounded-lg border">
									<h2 className="text-2xl font-semibold mb-4">
										Getting Started
									</h2>
									<p className="text-muted-foreground">
										Your authentication is now working with Clerk. You can start
										building your app!
									</p>
								</div>
							</div>
						</SignedIn>
					</div>
				</div>

				<footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
					<p>
						Powered by{" "}
						<a
							href="https://clerk.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
							target="_blank"
							className="font-bold hover:underline"
							rel="noreferrer"
						>
							Clerk
						</a>
					</p>
				</footer>
			</div>
		</main>
	);
}
