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
import { useCreateTicketCategory } from '@/services/tickets/categories/mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface CreateTicketCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createTicketCategorySchema = z.object({
  name: z.string().trim().min(1, 'Please enter a category name'),
});

type CreateTicketCategoryFormData = z.infer<typeof createTicketCategorySchema>;

const CreateTicketCategoryModal = ({
  open,
  onOpenChange,
}: CreateTicketCategoryModalProps) => {
  const createTicketCategoryMutation = useCreateTicketCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketCategoryFormData>({
    resolver: zodResolver(createTicketCategorySchema),
    defaultValues: {
      name: '',
    },
  });

  const isFormBusy = isSubmitting || createTicketCategoryMutation.isPending;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({
        name: '',
      });
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: CreateTicketCategoryFormData) => {
    try {
      await createTicketCategoryMutation.mutateAsync({
        name: data.name.trim(),
      });

      toast.success('Ticket category created successfully');
      handleDialogOpenChange(false);
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className='sm:max-w-lg'
        onInteractOutside={(e) => {
          if (isFormBusy) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>New Ticket Category</DialogTitle>
          <DialogDescription>
            Add a new category so tickets can be classified consistently.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='ticket-category-name'>
                Category Name
              </FieldLabel>
              <Input
                id='ticket-category-name'
                placeholder='e.g. Billing, Access, Infrastructure'
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
            <Button type='submit' disabled={isFormBusy}>
              {createTicketCategoryMutation.isPending
                ? 'Creating category...'
                : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketCategoryModal;
