'use client';

import { useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { useUpdateTicketCategory } from '@/services/tickets/categories/mutations';
import type { TicketCategory } from '@/types/ticket-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type UpdateTicketCategoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: TicketCategory;
};

const updateTicketCategorySchema = z.object({
  name: z.string().trim().min(1, 'Please enter a category name'),
});

type UpdateTicketCategoryFormData = z.infer<
  typeof updateTicketCategorySchema
>;

const UpdateTicketCategoryModal = ({
  open,
  onOpenChange,
  category,
}: UpdateTicketCategoryModalProps) => {
  const updateTicketCategoryMutation = useUpdateTicketCategory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateTicketCategoryFormData>({
    resolver: zodResolver(updateTicketCategorySchema),
    defaultValues: {
      name: category.name,
    },
  });

  const isFormBusy = isSubmitting || updateTicketCategoryMutation.isPending;

  useEffect(() => {
    reset({
      name: category.name,
    });
  }, [category, reset]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isFormBusy) {
      reset({
        name: category.name,
      });
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: UpdateTicketCategoryFormData) => {
    try {
      const response = await updateTicketCategoryMutation.mutateAsync({
        id: category.id,
        payload: {
          name: data.name.trim(),
        },
      });

      toast.success(response.message || 'Ticket category updated successfully');
      handleDialogOpenChange(false);
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className='sm:max-w-lg'
        onInteractOutside={(event) => {
          if (isFormBusy) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Ticket Category</DialogTitle>
          <DialogDescription>
            Rename this category for future ticket classification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='update-ticket-category-name'>
                Category name
              </FieldLabel>
              <Input
                id='update-ticket-category-name'
                disabled={isFormBusy}
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>
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
            <Button type='submit' disabled={isFormBusy || !isDirty}>
              {updateTicketCategoryMutation.isPending
                ? 'Saving changes...'
                : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTicketCategoryModal;
