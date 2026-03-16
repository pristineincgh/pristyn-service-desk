'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useBulkReassignTickets } from '@/services/tickets/mutations';
import { useUsersByScope } from '@/services/users/queries';
import { useAuthStore } from '@/store/auth-store';
import { formatUserDisplayName } from '@/lib/self-reference';
import { UserShort } from '@/types/user-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface ReassignBulkTicketsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketIds: string[];
  onReassigned?: () => void;
}

const reassignBulkTicketsSchema = z.object({
  assignedToId: z.string().min(1, 'Please select a user'),
});

type ReassignBulkTicketsFormData = z.infer<typeof reassignBulkTicketsSchema>;

const ReassignBulkTicketsModal = ({
  open,
  onOpenChange,
  ticketIds,
  onReassigned,
}: ReassignBulkTicketsModalProps) => {
  const authUser = useAuthStore((state) => state.authUser);
  const bulkReassignMutation = useBulkReassignTickets();
  const { data: usersByScopeResponse, isLoading: isUsersLoading } =
    useUsersByScope();

  const assignees = useMemo<UserShort[]>(() => {
    const scopedUsers = usersByScopeResponse?.users ?? [];

    if (!authUser) {
      return scopedUsers;
    }

    const usersMap = new Map<string, UserShort>();
    usersMap.set(authUser.id, {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role,
    });

    scopedUsers.forEach((user) => {
      usersMap.set(user.id, user);
    });

    return Array.from(usersMap.values());
  }, [authUser, usersByScopeResponse?.users]);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
    reset,
  } = useForm<ReassignBulkTicketsFormData>({
    resolver: zodResolver(reassignBulkTicketsSchema),
    defaultValues: {
      assignedToId: authUser?.id ?? '',
    },
  });

  const isFormBusy =
    isSubmitting || bulkReassignMutation.isPending || isUsersLoading;

  const resetModalState = () => {
    reset({
      assignedToId: authUser?.id ?? '',
    });
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetModalState();
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: ReassignBulkTicketsFormData) => {
    if (ticketIds.length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    try {
      const response = await bulkReassignMutation.mutateAsync({
        ticketIds,
        assignedToId: data.assignedToId,
      });

      toast.success(response.message || 'Tickets reassigned successfully');
      onReassigned?.();
      handleDialogOpenChange(false);
    } catch {
      // Error toast is handled in mutation hook.
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const currentAssignedToId = getValues('assignedToId');
    if (!currentAssignedToId && authUser?.id) {
      setValue('assignedToId', authUser.id, { shouldDirty: false });
    }
  }, [authUser?.id, getValues, open, setValue]);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className='sm:max-w-lg'
        onInteractOutside={(e) => {
          if (isFormBusy) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Reassign Tickets</DialogTitle>
          <DialogDescription>
            Reassign {ticketIds.length} selected ticket
            {ticketIds.length === 1 ? '' : 's'} to another user.
          </DialogDescription>
        </DialogHeader>

        {isUsersLoading ? (
          <>
            <div className='rounded-md border border-dashed p-4 text-sm text-muted-foreground flex items-center gap-2'>
              <Spinner />
              Loading users...
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleDialogOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : ticketIds.length === 0 ? (
          <>
            <div className='rounded-md border border-dashed p-4 text-sm text-muted-foreground'>
              No tickets selected for reassignment.
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleDialogOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <FieldGroup>
              <Controller
                name='assignedToId'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Assign To</FieldLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isFormBusy}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue
                          placeholder={
                            isUsersLoading ? 'Loading users...' : 'Select user'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {assignees.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {formatUserDisplayName(
                              user.name,
                              user.id,
                              authUser?.id
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleDialogOpenChange(false)}
                disabled={isFormBusy}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isFormBusy}>
                {bulkReassignMutation.isPending
                  ? 'Reassigning tickets...'
                  : 'Reassign Tickets'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReassignBulkTicketsModal;
