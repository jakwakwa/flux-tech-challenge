import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">404 - Page Not Found</CardTitle>
				</CardHeader>
				<CardContent className="text-center space-y-4">
					<p className="text-muted-foreground">
						The page you're looking for doesn't exist.
					</p>
					<Button asChild>
						<Link href="/dashboard">Return to Dashboard</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
