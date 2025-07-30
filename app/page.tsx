import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle, List, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default async function Home() {
	const { userId } = await auth();

	// If user is signed in, redirect to dashboard
	if (userId) {
		redirect("/dashboard");
	}

	return (
		<main className="min-h-screen flex flex-col">
			{/* Hero Section */}
			<div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					<div className="space-y-4">
						<h1 className="text-4xl md:text-6xl font-bold tracking-tight">
							Your Todo Lists,
							<span className="text-primary"> Simplified</span>
						</h1>
						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
							Organize your tasks, track your progress, and get things done with
							our intuitive todo list application.
						</p>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<SignUpButton mode="modal">
							<Button size="lg" className="text-lg px-8">
								Get Started Free
							</Button>
						</SignUpButton>
						<SignInButton mode="modal">
							<Button variant="outline" size="lg" className="text-lg px-8">
								Sign In
							</Button>
						</SignInButton>
					</div>

					{/* Features Grid */}
					<div className="grid md:grid-cols-3 gap-6 mt-16">
						<Card className="text-center">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
									<List className="h-6 w-6 text-primary" />
								</div>
								<CardTitle>Organize Lists</CardTitle>
								<CardDescription>
									Create multiple lists to organize your tasks by project,
									priority, or any way you prefer.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
									<CheckCircle className="h-6 w-6 text-primary" />
								</div>
								<CardTitle>Track Progress</CardTitle>
								<CardDescription>
									Mark tasks as complete and watch your progress with visual
									indicators and statistics.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
									<Search className="h-6 w-6 text-primary" />
								</div>
								<CardTitle>Find Tasks Fast</CardTitle>
								<CardDescription>
									Search through all your tasks quickly and filter by completion
									status or list.
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="border-t bg-muted/50">
				<div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
					<p>
						Built with Next.js and powered by{" "}
						<a
							href="https://clerk.com"
							target="_blank"
							className="font-medium hover:underline"
							rel="noreferrer"
						>
							Clerk
						</a>
					</p>
				</div>
			</footer>
		</main>
	);
}
