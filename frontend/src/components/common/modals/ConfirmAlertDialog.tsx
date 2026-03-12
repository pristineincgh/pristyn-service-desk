'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ConfirmAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive';
  isConfirming?: boolean;
  onConfirm: () => void | Promise<void>;
};

const ConfirmAlertDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  isConfirming = false,
  onConfirm,
}: ConfirmAlertDialogProps) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (isConfirming && !nextOpen) {
      return;
    }

    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isConfirming}
            variant={confirmVariant}
            onClick={(event) => {
              // Keep dialog open; parent closes it on successful completion.
              event.preventDefault();
              if (!isConfirming) {
                void onConfirm();
              }
            }}
          >
            {isConfirming ? 'Please wait...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmAlertDialog;
