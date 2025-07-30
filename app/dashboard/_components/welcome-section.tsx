import type { List } from "@/lib/types";

interface WelcomeSectionProps {
	selectedList?: List;
}

export function WelcomeSection({ selectedList }: WelcomeSectionProps) {
	return (
		<div className="space-y-2">
			{selectedList ? (
				<h1 className="text-2xl font-normal">
					Current List: <span className="font-bold">{selectedList.title}</span>
				</h1>
			) : (
				<h1 className="text-2xl font-bold">Welcome back 👋</h1>
			)}
			<p className="text-muted-foreground">
				Here's what's happening with your tasks today.
			</p>
		</div>
	);
}
