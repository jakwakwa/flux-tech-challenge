import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Modals
  modals: {
    createList: boolean;
    createTask: boolean;
    editList: { open: boolean; listId?: string };
    editTask: { open: boolean; taskId?: string };
  };
  openModal: (modal: keyof UIState['modals'], data?: any) => void;
  closeModal: (modal: keyof UIState['modals']) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: UIState['theme']) => void;

  // View preferences
  viewPreferences: {
    taskView: 'table' | 'grid' | 'kanban';
    listView: 'grid' | 'list';
    showCompletedTasks: boolean;
    taskSortBy: 'createdAt' | 'updatedAt' | 'title' | 'completed';
    taskSortOrder: 'asc' | 'desc';
  };
  setViewPreference: <K extends keyof UIState['viewPreferences']>(
    key: K,
    value: UIState['viewPreferences'][K]
  ) => void;

  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Sidebar
        sidebarOpen: true,
        setSidebarOpen: (open) => set((state) => {
          state.sidebarOpen = open;
        }),
        toggleSidebar: () => set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

        // Modals
        modals: {
          createList: false,
          createTask: false,
          editList: { open: false },
          editTask: { open: false },
        },
        openModal: (modal, data) => set((state) => {
          if (modal === 'editList' && data?.listId) {
            state.modals.editList = { open: true, listId: data.listId };
          } else if (modal === 'editTask' && data?.taskId) {
            state.modals.editTask = { open: true, taskId: data.taskId };
          } else if (modal === 'createList' || modal === 'createTask') {
            state.modals[modal] = true;
          }
        }),
        closeModal: (modal) => set((state) => {
          if (modal === 'editList') {
            state.modals.editList = { open: false };
          } else if (modal === 'editTask') {
            state.modals.editTask = { open: false };
          } else {
            state.modals[modal] = false;
          }
        }),

        // Toasts
        toasts: [],
        addToast: (toast) => {
          const id = `toast-${Date.now()}-${Math.random()}`;
          const newToast = { ...toast, id };
          
          set((state) => {
            state.toasts.push(newToast);
          });

          // Auto-remove toast after duration
          if (toast.duration !== 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, toast.duration || 5000);
          }
        },
        removeToast: (id) => set((state) => {
          state.toasts = state.toasts.filter(t => t.id !== id);
        }),
        clearToasts: () => set((state) => {
          state.toasts = [];
        }),

        // Theme
        theme: 'system',
        setTheme: (theme) => set((state) => {
          state.theme = theme;
        }),

        // View preferences
        viewPreferences: {
          taskView: 'table',
          listView: 'grid',
          showCompletedTasks: true,
          taskSortBy: 'createdAt',
          taskSortOrder: 'desc',
        },
        setViewPreference: (key, value) => set((state) => {
          state.viewPreferences[key] = value;
        }),

        // Loading states
        globalLoading: false,
        setGlobalLoading: (loading) => set((state) => {
          state.globalLoading = loading;
        }),
      })),
      {
        name: 'ui-store',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
          viewPreferences: state.viewPreferences,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);