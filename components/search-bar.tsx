"use client";

import { Filter, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { List } from "@/lib/types";

interface SearchBarProps {
	onSearch: (query: string) => void;
	onFilterChange: (filters: SearchFilters) => void;
	lists?: List[];
	placeholder?: string;
}

export interface SearchFilters {
	listId?: string;
	completed?: boolean;
	sortBy?: "createdAt" | "updatedAt" | "title" | "completed";
	sortOrder?: "asc" | "desc";
}

export function SearchBar({
	onSearch,
	onFilterChange,
	lists = [],
	placeholder = "Search tasks...",
}: SearchBarProps) {
	const [query, setQuery] = useState("");
	const [filters, setFilters] = useState<SearchFilters>({});
	const [showFilters, setShowFilters] = useState(false);
	const [debouncedQuery, setDebouncedQuery] = useState("");

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
		}, 300);

		return () => clearTimeout(timer);
	}, [query]);

	// Trigger search when debounced query changes
	useEffect(() => {
		onSearch(debouncedQuery);
	}, [debouncedQuery, onSearch]);

	const handleFilterChange = useCallback(
		(newFilters: SearchFilters) => {
			setFilters(newFilters);
			onFilterChange(newFilters);
		},
		[onFilterChange],
	);

	const handleClearSearch = useCallback(() => {
		setQuery("");
		setDebouncedQuery("");
		onSearch("");
	}, [onSearch]);

	const handleClearFilters = useCallback(() => {
		setFilters({});
		onFilterChange({});
		setShowFilters(false);
	}, [onFilterChange]);

	const activeFilterCount = Object.keys(filters).filter(
		(key) => filters[key as keyof SearchFilters] !== undefined,
	).length;

	return (
		<div className="flex items-center gap-2 w-full max-w-2xl">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder={placeholder}
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="pl-9 pr-9"
				/>
				{query && (
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
						onClick={handleClearSearch}
					>
						<X className="h-3 w-3" />
						<span className="sr-only">Clear search</span>
					</Button>
				)}
			</div>

			<Popover open={showFilters} onOpenChange={setShowFilters}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="relative"
						aria-label="Filter options"
					>
						<Filter className="h-4 w-4" />
						{activeFilterCount > 0 && (
							<Badge
								variant="secondary"
								className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
							>
								{activeFilterCount}
							</Badge>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80" align="end">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-medium">Filters</h4>
							{activeFilterCount > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClearFilters}
									className="h-8 px-2 text-xs"
								>
									Clear all
								</Button>
							)}
						</div>

						{/* List Filter */}
						{lists.length > 0 && (
							<div className="space-y-2">
								<Label htmlFor="list-filter">List</Label>
								<Select
									value={filters.listId || "all"}
									onValueChange={(value) =>
										handleFilterChange({
											...filters,
											listId: value === "all" ? undefined : value,
										})
									}
								>
									<SelectTrigger id="list-filter">
										<SelectValue placeholder="All lists" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All lists</SelectItem>
										{lists.map((list) => (
											<SelectItem key={list.id} value={list.id}>
												{list.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						{/* Status Filter */}
						<div className="space-y-2">
							<Label>Status</Label>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="completed-filter"
									checked={filters.completed === true}
									onCheckedChange={(checked) =>
										handleFilterChange({
											...filters,
											completed: checked === true ? true : undefined,
										})
									}
								/>
								<Label
									htmlFor="completed-filter"
									className="text-sm font-normal cursor-pointer"
								>
									Show only completed tasks
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="incomplete-filter"
									checked={filters.completed === false}
									onCheckedChange={(checked) =>
										handleFilterChange({
											...filters,
											completed: checked === true ? false : undefined,
										})
									}
								/>
								<Label
									htmlFor="incomplete-filter"
									className="text-sm font-normal cursor-pointer"
								>
									Show only incomplete tasks
								</Label>
							</div>
						</div>

						{/* Sort Options */}
						<div className="space-y-2">
							<Label htmlFor="sort-by">Sort by</Label>
							<Select
								value={filters.sortBy || "createdAt"}
								onValueChange={(value: any) =>
									handleFilterChange({
										...filters,
										sortBy: value,
									})
								}
							>
								<SelectTrigger id="sort-by">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="createdAt">Date created</SelectItem>
									<SelectItem value="updatedAt">Date updated</SelectItem>
									<SelectItem value="title">Title</SelectItem>
									<SelectItem value="completed">Status</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="sort-order">Sort order</Label>
							<Select
								value={filters.sortOrder || "desc"}
								onValueChange={(value: any) =>
									handleFilterChange({
										...filters,
										sortOrder: value,
									})
								}
							>
								<SelectTrigger id="sort-order">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="asc">Ascending</SelectItem>
									<SelectItem value="desc">Descending</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
