import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col items-center">
			<div className="flex-1 w-full flex flex-col py-12 gap-20 items-center">
				<div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
					<div className="flex-1 flex flex-col gap-6 px-4">
						<SignedOut>
							<div className="text-center">
								<h1 className="text-4xl font-bold mb-4">
									Welcome to Flux Todo App
								</h1>
								<p className="text-lg text-muted-foreground mb-8">
									Sign in or sign up to get started with creating your first
									task.
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
										Create your first task
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
