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
	Calendar,
	CheckCircle2,
	Circle,
	Flag,
	MoreHorizontal,
	Plus,
	Search,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
		id: "select",
		header: ({ table }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "status",
		header: "Status",
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
		enableSorting: false,
	},
	{
		accessorKey: "title",
		header: "Task",
		cell: ({ row }) => {
			const task = row.original;
			return (
				<div className="flex flex-col gap-1 max-w-[300px]">
					<div
						className={`font-medium ${
							task.completed ? "line-through text-muted-foreground" : ""
						}`}
					>
						{task.title}
					</div>
					{task.description && (
						<div
							className={`text-sm text-muted-foreground ${
								task.completed ? "line-through" : ""
							}`}
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
		header: "Created",
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{format(new Date(row.original.createdAt), "MMM dd, yyyy")}
			</div>
		),
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
						<DropdownMenuItem>Duplicate</DropdownMenuItem>
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
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");

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
			rowSelection,
			columnFilters,
			globalFilter,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
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

	const completedTasks = tasks.filter((task) => task.completed).length;
	const totalTasks = tasks.length;

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
				{createDialog}
			</div>

			{/* Search and filters */}
			<div className="flex items-center gap-2">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search tasks..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Badge variant="secondary" className="ml-auto">
					{table.getFilteredRowModel().rows.length} tasks
				</Badge>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
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
									data-state={row.getIsSelected() && "selected"}
									className={row.original.completed ? "bg-muted/50" : ""}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
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
