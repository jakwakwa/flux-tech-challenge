'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useListStore } from '@/lib/store/use-list-store';
import { useUIStore } from '@/lib/store/use-ui-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from '@/components/ui/alert-dialog';
import { EditListDialog } from '@/components/create-dialog';

interface DashboardTableClientProps {
  initialLists: Array<{
    id: string;
    title: string;
    createdAt: Date;
    tasks: Array<{
      id: string;
      completed: boolean;
    }>;
  }>;
}

export function DashboardTableClient({ initialLists }: DashboardTableClientProps) {
  const { lists, deleteList, isDeleting } = useListStore();
  const { addToast } = useUIStore();
  const [editingList, setEditingList] = useState<{ id: string; title: string } | null>(null);

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>List Name</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayLists.map((list) => {
            const taskCount = list.tasks?.length || 0;
            const completedCount = list.tasks?.filter(t => t.completed).length || 0;
            const progressPercentage = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;

            return (
              <TableRow key={list.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/lists/${list.id}`}
                    className="hover:underline"
                  >
                    {list.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{taskCount}</Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {completedCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${progressPercentage}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(list.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        disabled={isDeleting[list.id]}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/lists/${list.id}`}>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          View Tasks
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setEditingList({ id: list.id, title: list.title })}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit List Dialog */}
      {editingList && (
        <EditListDialog
          list={editingList}
          open={!!editingList}
          onOpenChange={(open) => !open && setEditingList(null)}
        />
      )}
    </>
  );
}