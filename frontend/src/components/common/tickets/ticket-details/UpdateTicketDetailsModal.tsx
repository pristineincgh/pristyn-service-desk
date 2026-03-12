'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface UpdateTicketDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const UpdateTicketDetailsModal = ({
  open,
  onOpenChange,
  title,
  description,
  isSubmitting,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onReset,
}: UpdateTicketDetailsModalProps) => {
  const isInvalid = !title.trim() || !description.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) {
          onReset();
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className='sm:max-w-2xl'
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Ticket Details</DialogTitle>
          <DialogDescription>
            Update the ticket title and description.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          <FieldGroup>
            <Field data-invalid={!title.trim()}>
              <FieldLabel htmlFor='ticket-edit-title'>Title</FieldLabel>
              <Input
                id='ticket-edit-title'
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                disabled={isSubmitting}
                placeholder='Ticket title'
              />
              {!title.trim() ? (
                <FieldError errors={[{ message: 'Title is required' }]} />
              ) : null}
            </Field>

            <Field data-invalid={!description.trim()}>
              <FieldLabel htmlFor='ticket-edit-description'>
                Description
              </FieldLabel>
              <Textarea
                id='ticket-edit-description'
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                disabled={isSubmitting}
                placeholder='Describe the ticket'
                className='min-h-36'
              />
              {!description.trim() ? (
                <FieldError errors={[{ message: 'Description is required' }]} />
              ) : null}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                onReset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={onSubmit}
              disabled={isSubmitting || isInvalid}
            >
              {isSubmitting ? 'Saving...' : 'Save details'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTicketDetailsModal;
