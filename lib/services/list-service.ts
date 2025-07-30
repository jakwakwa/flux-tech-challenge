import type {
	CreateListRequest,
	List,
	PaginationParams,
	UpdateListRequest,
} from "@/lib/types";
import { ApiError } from "@/lib/utils/errors/api-error";

interface ListResponse {
	data: List[];
	page: number;
	totalPages: number;
	total: number;
}

interface ListSearchParams extends PaginationParams {
	search?: string;
	sortBy?: "createdAt" | "updatedAt" | "title";
	sortOrder?: "asc" | "desc";
}

class ListService {
	private baseUrl = "/api/lists";

	/**
	 * Get all lists with pagination and search
	 */
	async getLists(params: ListSearchParams = {}): Promise<ListResponse> {
		const searchParams = new URLSearchParams();

		if (params.page) searchParams.append("page", params.page.toString());
		if (params.limit) searchParams.append("limit", params.limit.toString());
		if (params.search) searchParams.append("search", params.search);
		if (params.sortBy) searchParams.append("sortBy", params.sortBy);
		if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

		try {
			const response = await fetch(`${this.baseUrl}?${searchParams}`);

			if (!response.ok) {
				throw await ApiError.fromResponse(response);
			}

			const result = await response.json();
			return {
				data: result.data || [],
				page: result.meta?.page || 1,
				totalPages: result.meta?.totalPages || 1,
				total: result.meta?.total || 0,
			};
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError("Failed to fetch lists", "FETCH_ERROR", error);
		}
	}

	/**
	 * Get a single list by ID
	 */
	async getList(id: string): Promise<List> {
		try {
			const response = await fetch(`${this.baseUrl}/${id}`);

			if (!response.ok) {
				throw await ApiError.fromResponse(response);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError("Failed to fetch list", "FETCH_ERROR", error);
		}
	}

	/**
	 * Create a new list
	 */
	async createList(data: CreateListRequest): Promise<List> {
		try {
			const response = await fetch(this.baseUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw await ApiError.fromResponse(response);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError("Failed to create list", "CREATE_ERROR", error);
		}
	}

	/**
	 * Update a list
	 */
	async updateList(id: string, data: UpdateListRequest): Promise<List> {
		try {
			const response = await fetch(`${this.baseUrl}?listId=${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw await ApiError.fromResponse(response);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError("Failed to update list", "UPDATE_ERROR", error);
		}
	}

	/**
	 * Delete a list
	 */
	async deleteList(id: string): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}?listId=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw await ApiError.fromResponse(response);
			}
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError("Failed to delete list", "DELETE_ERROR", error);
		}
	}
}

export const listService = new ListService();
