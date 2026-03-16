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
import { useCustomersQuery } from '@/services/customers/queries';
import { useUpdateTicket } from '@/services/tickets/mutations';
import { useUsersByScope } from '@/services/users/queries';
import { useAuthStore } from '@/store/auth-store';
import { formatUserDisplayName } from '@/lib/self-reference';
import { TicketShort, TicketStatus } from '@/types/ticket-types';
import { UserShort } from '@/types/user-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Spinner } from '@/components/ui/spinner';

interface AssignTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tickets: TicketShort[];
}

const assignTicketSchema = z.object({
  ticketId: z.string().min(1, 'Please select a ticket'),
  assignedToId: z.string().min(1, 'Please select a user'),
});

type AssignTicketFormData = z.infer<typeof assignTicketSchema>;

const ASSIGNABLE_STATUSES: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
];

const AssignTicketModal = ({
  open,
  onOpenChange,
  tickets,
}: AssignTicketModalProps) => {
  const authUser = useAuthStore((state) => state.authUser);
  const updateTicketMutation = useUpdateTicket();
  const { data: usersByScopeResponse, isLoading: isUsersLoading } =
    useUsersByScope();
  const { data: customerListResponse, isLoading: isCustomersLoading } =
    useCustomersQuery();

  const assignableTickets = useMemo(
    () =>
      tickets.filter((ticket) => ASSIGNABLE_STATUSES.includes(ticket.status)),
    [tickets]
  );

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

  const preferredTicketId = useMemo(() => {
    const unassigned = assignableTickets.find((ticket) => !ticket.assignedTo);
    return unassigned?.id ?? assignableTickets[0]?.id ?? '';
  }, [assignableTickets]);
  const customerById = useMemo(
    () =>
      new Map(
        (customerListResponse?.customers ?? []).map((customer) => [
          customer.id,
          customer,
        ])
      ),
    [customerListResponse?.customers]
  );

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
    reset,
  } = useForm<AssignTicketFormData>({
    resolver: zodResolver(assignTicketSchema),
    defaultValues: {
      ticketId: '',
      assignedToId: authUser?.id ?? '',
    },
  });

  const isFormBusy =
    isSubmitting ||
    updateTicketMutation.isPending ||
    isUsersLoading ||
    isCustomersLoading;
  const isLookupLoading = isUsersLoading || isCustomersLoading;

  const resetModalState = () => {
    reset({
      ticketId: preferredTicketId,
      assignedToId: authUser?.id ?? '',
    });
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetModalState();
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: AssignTicketFormData) => {
    try {
      const response = await updateTicketMutation.mutateAsync({
        id: data.ticketId,
        data: {
          assignedToId: data.assignedToId,
        },
      });

      toast.success(response.message || 'Ticket assigned successfully');
      handleDialogOpenChange(false);
    } catch {
      // Error toast is handled in mutation hook.
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const currentTicketId = getValues('ticketId');
    if (!currentTicketId && preferredTicketId) {
      setValue('ticketId', preferredTicketId, { shouldDirty: false });
    }

    const currentAssignedToId = getValues('assignedToId');
    if (!currentAssignedToId && authUser?.id) {
      setValue('assignedToId', authUser.id, { shouldDirty: false });
    }
  }, [authUser?.id, getValues, open, preferredTicketId, setValue]);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className='sm:max-w-lg'
        onInteractOutside={(e) => {
          if (isFormBusy) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
          <DialogDescription>
            Assign an open or in-progress ticket to a user.
          </DialogDescription>
        </DialogHeader>

        {isLookupLoading ? (
          <>
            <div className='rounded-md border border-dashed p-4 text-sm text-muted-foreground flex items-center gap-2'>
              <Spinner />
              Loading ticket and user data...
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
        ) : assignableTickets.length === 0 ? (
          <>
            <div className='rounded-md border border-dashed p-4 text-sm text-muted-foreground'>
              No open or in-progress tickets available for assignment.
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
                name='ticketId'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Ticket</FieldLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isFormBusy}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select ticket' />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableTickets.map((ticket) => (
                          <SelectItem key={ticket.id} value={ticket.id}>
                            {ticket.ticketNumber} - {ticket.title} -{' '}
                            {customerById.get(ticket.customerId)?.name ??
                              ticket.customerId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

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
                {updateTicketMutation.isPending
                  ? 'Assigning ticket...'
                  : 'Assign Ticket'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignTicketModal;
