import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";

export default async function ProtectedPage() {
	const user = await currentUser();
	
	if (!user) {
		redirect("/sign-in");
	}

	return (
		<div className="flex-1 w-full flex flex-col gap-12">
			<div className="w-full">
				<div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
					<InfoIcon size="16" strokeWidth={2} />
					This is a protected page that you can only see as an authenticated
					user
				</div>
			</div>
			<div className="flex flex-col gap-2 items-start">
				<h2 className="font-bold text-2xl mb-4">Your user details</h2>
				<pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
					{JSON.stringify(user, null, 2)}
				</pre>
			</div>
			<div>
				<h2 className="font-bold text-2xl mb-4">Next steps</h2>
				<div className="space-y-4">
					<div className="bg-card p-4 rounded-lg border">
						<h3 className="font-semibold mb-2">Authentication Complete</h3>
						<p className="text-sm text-muted-foreground">
							You're successfully authenticated with Clerk. You can now build your app's features!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
