'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/use-ui-store';
import { useListStore } from '@/lib/store/use-list-store';
import { CreateDialog } from '@/components/create-dialog';

export function ModalProvider() {
  const { modals, closeModal } = useUIStore();
  const { lists } = useListStore();

  // Create List Modal
  const createListModal = modals.createList && (
    <CreateDialog
      defaultMode="list"
      open={modals.createList}
      onOpenChange={(open) => !open && closeModal('createList')}
    />
  );

  // Create Task Modal
  const createTaskModal = modals.createTask && lists.length > 0 && (
    <CreateDialog
      defaultMode="task"
      open={modals.createTask}
      onOpenChange={(open) => !open && closeModal('createTask')}
    />
  );

  return (
    <>
      {createListModal}
      {createTaskModal}
    </>
  );
}