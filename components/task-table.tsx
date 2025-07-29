"use client";

import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Calendar,
	CheckCircle2,
	Circle,
	Filter,
	Flag,
	MoreHorizontal,
	Plus,
	Search,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

// Types for our todo tasks
export interface Task {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	listId: string;
	listName: string;
	createdAt: Date;
	updatedAt: Date;
}

interface TaskTableProps {
	tasks: Task[];
	onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
	onTaskDelete?: (taskId: string) => void;
	onTaskEdit?: (task: Task) => void;
	createDialog?: React.ReactNode;
}

// Define columns for the task table
const createColumns = (
	onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void,
	onTaskDelete?: (taskId: string) => void,
	onTaskEdit?: (task: Task) => void,
): ColumnDef<Task>[] => [
	{
		id: "status",
		header: "Status",
		accessorKey: "completed",
		size: 80,
		minSize: 60,
		maxSize: 100,
		cell: ({ row }) => {
			const task = row.original;
			return (
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						onTaskUpdate?.(task.id, { completed: !task.completed })
					}
					className="h-8 w-8 p-0"
				>
					{task.completed ? (
						<CheckCircle2 className="h-4 w-4 text-green-500" />
					) : (
						<Circle className="h-4 w-4 text-muted-foreground" />
					)}
					<span className="sr-only">
						{task.completed ? "Mark as pending" : "Mark as complete"}
					</span>
				</Button>
			);
		},
		filterFn: (row, id, value) => {
			if (value === "all") return true;
			if (value === "completed") return row.original.completed;
			return true;
		},
		enableSorting: true,
		sortingFn: (rowA, rowB) => {
			const a = rowA.original.completed;
			const b = rowB.original.completed;
			return a === b ? 0 : a ? 1 : -1;
		},
	},
	{
		accessorKey: "title",
		header: "Task",
		size: 300,
		minSize: 200,
		maxSize: 400,
		cell: ({ row }) => {
			const task = row.original;
			return (
				<div className="flex flex-col gap-1 w-full min-w-0">
					<div
						className={`font-medium text-md truncate ${
							task.completed ? "line-through text-muted-foreground" : ""
						}`}
						title={task.title}
					>
						{task.title}
					</div>
					{task.description && (
						<div
							className={`text-sm text-muted-foreground truncate ${
								task.completed ? "line-through" : ""
							}`}
							title={task.description}
						>
							{task.description}
						</div>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "listName",
		header: "List",
		cell: ({ row }) => (
			<Badge variant="outline" className="text-xs">
				{row.original.listName}
			</Badge>
		),
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 p-0 hover:bg-transparent"
				>
					Created
					{column.getIsSorted() === "asc" ? (
						<ArrowUp className="ml-2 h-4 w-4" />
					) : column.getIsSorted() === "desc" ? (
						<ArrowDown className="ml-2 h-4 w-4" />
					) : (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{format(new Date(row.original.createdAt), "MMM dd, yyyy")}
			</div>
		),
		sortingFn: (rowA, rowB) => {
			const a = new Date(rowA.original.createdAt).getTime();
			const b = new Date(rowB.original.createdAt).getTime();
			return a - b;
		},
	},
	{
		accessorKey: "updatedAt",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 p-0 hover:bg-transparent"
				>
					Updated
					{column.getIsSorted() === "asc" ? (
						<ArrowUp className="ml-2 h-4 w-4" />
					) : column.getIsSorted() === "desc" ? (
						<ArrowDown className="ml-2 h-4 w-4" />
					) : (
						<ArrowUpDown className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{format(new Date(row.original.updatedAt), "MMM dd, yyyy")}
			</div>
		),
		sortingFn: (rowA, rowB) => {
			const a = new Date(rowA.original.updatedAt).getTime();
			const b = new Date(rowB.original.updatedAt).getTime();
			return a - b;
		},
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => {
			const task = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
							<span className="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuItem
							onClick={() =>
								onTaskUpdate?.(task.id, { completed: !task.completed })
							}
						>
							{task.completed ? "Mark as pending" : "Mark as complete"}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onTaskEdit?.(task)}>
							Edit task
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => onTaskDelete?.(task.id)}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		enableSorting: false,
	},
];

export function TaskTable({
	tasks,
	onTaskUpdate,
	onTaskDelete,
	onTaskEdit,
	createDialog,
}: TaskTableProps) {
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState<string>("all");

	const columns = React.useMemo(
		() => createColumns(onTaskUpdate, onTaskDelete, onTaskEdit),
		[onTaskUpdate, onTaskDelete, onTaskEdit],
	);

	const table = useReactTable({
		data: tasks,
		columns,
		state: {
			sorting,
			columnVisibility,
			columnFilters,
			globalFilter,
		},
		enableColumnResizing: true,
		columnResizeMode: "onChange",
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		globalFilterFn: (row, columnId, value) => {
			const task = row.original;
			const searchValue = value.toLowerCase();
			return (
				task.title.toLowerCase().includes(searchValue) ||
				task.description?.toLowerCase().includes(searchValue) ||
				task.listName.toLowerCase().includes(searchValue)
			);
		},
	});

	// Handle status filter changes
	React.useEffect(() => {
		if (statusFilter === "all") {
			table.getColumn("status")?.setFilterValue(undefined);
		} else {
			table.getColumn("status")?.setFilterValue(statusFilter);
		}
	}, [statusFilter, table]);

	const completedTasks = tasks.filter((task) => task.completed).length;
	const totalTasks = tasks.length;

	// Quick sort handlers
	const handleQuickSort = (sortType: string) => {
		switch (sortType) {
			case "newest":
				setSorting([{ id: "createdAt", desc: true }]);
				break;
			case "oldest":
				setSorting([{ id: "createdAt", desc: false }]);
				break;
			case "updated":
				setSorting([{ id: "updatedAt", desc: true }]);
				break;
			case "status":
				setSorting([{ id: "status", desc: false }]);
				break;
			default:
				setSorting([]);
		}
	};

	return (
		<div className="space-y-4">
			{/* Header with stats and actions */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h2 className="text-xl font-semibold">Recent Tasks</h2>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>
							{completedTasks}/{totalTasks} completed
						</span>
						<div className="w-16 bg-muted rounded-full h-2">
							<div
								className="bg-green-500 h-2 rounded-full transition-all"
								style={{
									width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Search and filters */}
			<div className="flex items-center gap-2 flex-wrap">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search tasks..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-9"
					/>
				</div>

				{/* Status Filter */}
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-32">
						<Filter className="mr-2 h-4 w-4" />
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Tasks</SelectItem>
						<SelectItem value="completed">Completed</SelectItem>
					</SelectContent>
				</Select>

				{/* Sort Options */}
				<Select onValueChange={handleQuickSort}>
					<SelectTrigger className="w-40">
						<Calendar className="mr-2 h-4 w-4" />
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="newest">Newest First</SelectItem>
						<SelectItem value="oldest">Oldest First</SelectItem>
						<SelectItem value="updated">Recently Updated</SelectItem>
						<SelectItem value="status">By Status</SelectItem>
					</SelectContent>
				</Select>

				<Badge variant="secondary" className="ml-auto">
					{table.getFilteredRowModel().rows.length} tasks
				</Badge>
				
				{/* Create Task Button */}
				<div className="ml-2">
					{createDialog}
				</div>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table style={{ tableLayout: "fixed", width: "100%" }}>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										style={{
											width: header.getSize(),
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className={row.original.completed ? "bg-muted/50" : ""}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											style={{
												width: cell.column.getSize(),
											}}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									<div className="flex flex-col items-center gap-2">
										<div className="text-muted-foreground">No tasks found</div>
										{createDialog}
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between px-2">
				<div className="text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="flex items-center gap-6 lg:gap-8">
					<div className="flex items-center gap-2">
						<p className="text-sm font-medium">Rows per page</p>
						<select
							value={table.getState().pagination.pageSize}
							onChange={(e) => table.setPageSize(Number(e.target.value))}
							className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
						>
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<option key={pageSize} value={pageSize}>
									{pageSize}
								</option>
							))}
						</select>
					</div>
					<div className="flex w-24 items-center justify-center text-sm font-medium">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							←
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							→
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
