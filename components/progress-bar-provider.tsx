"use client";

import { Suspense, useEffect, useState } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";

function ProgressBarContent() {
	const [isNavigating, setIsNavigating] = useState(false);

	useEffect(() => {
		// Show progress bar when navigation starts
		setIsNavigating(true);

		// Hide progress bar after navigation completes
		const timer = setTimeout(() => {
			setIsNavigating(false);
		}, 300);

		return () => clearTimeout(timer);
	}, []);

	return isNavigating ? <ProgressBar /> : null;
}

export function ProgressBarProvider() {
	return (
		<Suspense fallback={null}>
			<ProgressBarContent />
		</Suspense>
	);
}
