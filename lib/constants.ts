// Application constants and limits
export const APP_LIMITS = {
	// Maximum number of lists a user can create
	MAX_LISTS_PER_USER: 10,
	// Maximum number of tasks per list (for future use)
	MAX_TASKS_PER_LIST: 100,
} as const;

// Error messages for limits
export const LIMIT_ERRORS = {
	MAX_LISTS_EXCEEDED: `You have reached the maximum limit of ${APP_LIMITS.MAX_LISTS_PER_USER} lists. Please delete some lists before creating new ones.`,
	MAX_TASKS_EXCEEDED: `You have reached the maximum limit of ${APP_LIMITS.MAX_TASKS_PER_LIST} tasks per list.`,
} as const;
