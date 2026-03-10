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
import { useBulkUpdateTicketStatus } from '@/services/tickets/mutations';
import { TicketStatus } from '@/types/ticket-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface UpdateBulkTicketStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketIds: string[];
  onStatusesUpdated?: () => void;
}

const updateBulkTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus, {
    message: 'Please select a status',
  }),
});

type UpdateBulkTicketStatusFormData = z.infer<
  typeof updateBulkTicketStatusSchema
>;

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: TicketStatus.OPEN, label: 'Open' },
  { value: TicketStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TicketStatus.RESOLVED, label: 'Resolved' },
  { value: TicketStatus.CLOSED, label: 'Closed' },
];

const UpdateBulkTicketStatusModal = ({
  open,
  onOpenChange,
  ticketIds,
  onStatusesUpdated,
}: UpdateBulkTicketStatusModalProps) => {
  const bulkUpdateStatusMutation = useBulkUpdateTicketStatus();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<UpdateBulkTicketStatusFormData>({
    resolver: zodResolver(updateBulkTicketStatusSchema),
    defaultValues: {
      status: TicketStatus.OPEN,
    },
  });

  const isFormBusy = isSubmitting || bulkUpdateStatusMutation.isPending;
  const selectedCountLabel = useMemo(
    () => `${ticketIds.length} selected ticket${ticketIds.length === 1 ? '' : 's'}`,
    [ticketIds.length]
  );

  const resetModalState = () => {
    reset({
      status: TicketStatus.OPEN,
    });
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetModalState();
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: UpdateBulkTicketStatusFormData) => {
    if (ticketIds.length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    try {
      const response = await bulkUpdateStatusMutation.mutateAsync({
        ticketIds,
        status: data.status,
      });

      toast.success(response.message || 'Ticket statuses updated successfully');
      onStatusesUpdated?.();
      handleDialogOpenChange(false);
    } catch {
      // Error toast is handled in mutation hook.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Update Ticket Status</DialogTitle>
          <DialogDescription>
            Set a new status for {selectedCountLabel}.
          </DialogDescription>
        </DialogHeader>

        {ticketIds.length === 0 ? (
          <>
            <div className='rounded-md border border-dashed p-4 text-sm text-muted-foreground'>
              No tickets selected for status update.
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
                name='status'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isFormBusy}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                {bulkUpdateStatusMutation.isPending
                  ? 'Updating statuses...'
                  : 'Update Status'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBulkTicketStatusModal;
