'use client';

import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useUIStore } from '@/lib/store/use-ui-store';

export function ToastProvider() {
  const { toasts, removeToast } = useUIStore();

  useEffect(() => {
    // Sync store toasts with sonner
    toasts.forEach((t) => {
      switch (t.type) {
        case 'success':
          toast.success(t.title, {
            description: t.description,
            id: t.id,
            duration: t.duration,
            onDismiss: () => removeToast(t.id),
          });
          break;
        case 'error':
          toast.error(t.title, {
            description: t.description,
            id: t.id,
            duration: t.duration,
            onDismiss: () => removeToast(t.id),
          });
          break;
        case 'warning':
          toast.warning(t.title, {
            description: t.description,
            id: t.id,
            duration: t.duration,
            onDismiss: () => removeToast(t.id),
          });
          break;
        case 'info':
          toast.info(t.title, {
            description: t.description,
            id: t.id,
            duration: t.duration,
            onDismiss: () => removeToast(t.id),
          });
          break;
      }
    });
  }, [toasts, removeToast]);

  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      theme="system"
      className="[&>div]:!top-16" // Adjust position to account for header
      toastOptions={{
        classNames: {
          toast: 'font-sans',
          title: 'text-sm font-medium',
          description: 'text-xs text-muted-foreground',
        },
      }}
    />
  );
}