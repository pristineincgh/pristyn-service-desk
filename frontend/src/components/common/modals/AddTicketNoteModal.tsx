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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTicketNote } from '@/services/tickets/notes/mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface AddTicketNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId?: string;
  onNoteCreated?: () => void;
}

const addTicketNoteSchema = z.object({
  content: z.string().trim().min(1, 'Please enter a note'),
  isInternal: z.boolean(),
});

type AddTicketNoteFormData = z.infer<typeof addTicketNoteSchema>;

const AddTicketNoteModal = ({
  open,
  onOpenChange,
  ticketId,
  onNoteCreated,
}: AddTicketNoteModalProps) => {
  const createTicketNoteMutation = useCreateTicketNote();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddTicketNoteFormData>({
    resolver: zodResolver(addTicketNoteSchema),
    defaultValues: {
      content: '',
      isInternal: true,
    },
  });

  const isFormBusy = isSubmitting || createTicketNoteMutation.isPending;

  const resetModalState = () => {
    reset({
      content: '',
      isInternal: true,
    });
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetModalState();
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: AddTicketNoteFormData) => {
    if (!ticketId) {
      toast.error('No ticket selected');
      return;
    }

    try {
      const response = await createTicketNoteMutation.mutateAsync({
        ticketId,
        data: {
          content: data.content.trim(),
          isInternal: data.isInternal,
        },
      });

      toast.success(response.message || 'Ticket note added successfully');
      onNoteCreated?.();
      handleDialogOpenChange(false);
    } catch {
      // Error toast is handled in mutation hook.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add Ticket Note</DialogTitle>
          <DialogDescription>
            Add a note for this ticket to capture updates and context.
          </DialogDescription>
        </DialogHeader>

        {!ticketId ? (
          <>
            <div className='rounded-md border border-dashed p-4 text-sm text-muted-foreground'>
              No ticket selected to add a note.
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
              <Field data-invalid={!!errors.content}>
                <FieldLabel htmlFor='ticket-note-content'>Note</FieldLabel>
                <Textarea
                  id='ticket-note-content'
                  placeholder='Write your note here...'
                  disabled={isFormBusy}
                  aria-invalid={!!errors.content}
                  {...register('content')}
                />
                <FieldError errors={[errors.content]} />
              </Field>

              <Controller
                name='isInternal'
                control={control}
                render={({ field }) => (
                  <Field>
                    <label
                      htmlFor='ticket-note-internal'
                      className='flex items-center gap-2 text-sm'
                    >
                      <Checkbox
                        id='ticket-note-internal'
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        disabled={isFormBusy}
                      />
                      Internal note (not customer-visible)
                    </label>
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
                {createTicketNoteMutation.isPending ? 'Adding note...' : 'Add Note'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddTicketNoteModal;
