'use client';

import { MoreHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useListStore } from "@/lib/store/use-list-store";
import { useUIStore } from "@/lib/store/use-ui-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateDialog, EditListDialog } from "@/components/create-dialog";

// Get consistent emoji for lists based on ID
const getEmojiForList = (listId: string) => {
  const emojis = [
    "📝", "💼", "🎯", "🛒", "🏠", "📚",
    "🎵", "🎨", "🍳", "🏃", "💡", "🎮",
  ];
  
  let hash = 0;
  for (let i = 0; i < listId.length; i++) {
    const char = listId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return emojis[Math.abs(hash) % emojis.length];
};

interface NavTodoListsClientProps {
  initialLists: Array<{
    id: string;
    title: string;
    tasks: Array<{
      id: string;
      completed: boolean;
    }>;
  }>;
}

export function NavTodoListsClient({ initialLists }: NavTodoListsClientProps) {
  const { lists, deleteList, isDeleting } = useListStore();
  const { addToast } = useUIStore();
  const pathname = usePathname();
  const [editingList, setEditingList] = useState<{ id: string; title: string } | null>(null);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState<string | null>(null);

  // Use store lists if available, fallback to initial lists
  const displayLists = lists.length > 0 ? lists : initialLists;

  const handleDeleteList = async (id: string, title: string) => {
    try {
      await deleteList(id);
      addToast({
        type: 'success',
        title: 'List deleted',
        description: `"${title}" has been deleted successfully.`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to delete list',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Your Lists</SidebarGroupLabel>
        <SidebarMenu>
          {displayLists.map((list) => {
            const taskCount = list.tasks?.length || 0;
            const completedCount = list.tasks?.filter(t => t.completed).length || 0;
            const isCurrentList = pathname === `/lists/${list.id}`;

            return (
              <SidebarMenuItem key={list.id}>
                <SidebarMenuButton asChild tooltip={list.title} isActive={isCurrentList}>
                  <Link href={`/lists/${list.id}`}>
                    <span className="text-base mr-2">{getEmojiForList(list.id)}</span>
                    <span className="flex-1 truncate">{list.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {completedCount}/{taskCount}
                    </span>
                  </Link>
                </SidebarMenuButton>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover disabled={isDeleting[list.id]}>
                      {isDeleting[list.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal />
                      )}
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side="bottom"
                    align="end"
                  >
                    <DropdownMenuItem 
                      onClick={() => setEditingList({ id: list.id, title: list.title })}
                    >
                      <span>Edit List</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setCreateTaskDialogOpen(list.id)}
                    >
                      <span>Add Task</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive"
                        >
                          <span>Delete List</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the list
                            "{list.title}" and all {taskCount} task{taskCount !== 1 ? 's' : ''} in this list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteList(list.id, list.title)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete List
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      {/* Edit List Dialog */}
      {editingList && (
        <EditListDialog
          list={editingList}
          open={!!editingList}
          onOpenChange={(open) => !open && setEditingList(null)}
        />
      )}

      {/* Create Task Dialog */}
      {createTaskDialogOpen && (
        <CreateDialog
          defaultMode="task"
          currentListId={createTaskDialogOpen}
          open={!!createTaskDialogOpen}
          onOpenChange={(open) => !open && setCreateTaskDialogOpen(null)}
        />
      )}
    </>
  );
}