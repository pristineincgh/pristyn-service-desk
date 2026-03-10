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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCreateCustomer } from '@/services/customers/mutations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const addCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Please enter customer name'),
  phone: z.string().trim().min(1, 'Please enter customer phone number'),
  email: z.union([z.email('Please enter a valid email'), z.literal('')]).optional(),
});

type AddCustomerFormData = z.infer<typeof addCustomerSchema>;

const AddCustomerModal = ({ open, onOpenChange }: AddCustomerModalProps) => {
  const createCustomerMutation = useCreateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCustomerFormData>({
    resolver: zodResolver(addCustomerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
    },
  });

  const isFormBusy = isSubmitting || createCustomerMutation.isPending;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: AddCustomerFormData) => {
    try {
      const response = await createCustomerMutation.mutateAsync({
        name: data.name.trim(),
        phone: data.phone.trim(),
        ...(data.email?.trim() ? { email: data.email.trim() } : {}),
      });

      toast.success(response.message || 'Customer created successfully');
      handleDialogOpenChange(false);
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>
            Create a customer record for ticket intake and assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='customer-name'>Name</FieldLabel>
              <Input
                id='customer-name'
                placeholder='Customer full name'
                disabled={isFormBusy}
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor='customer-phone'>Phone</FieldLabel>
              <Input
                id='customer-phone'
                placeholder='Phone number'
                disabled={isFormBusy}
                aria-invalid={!!errors.phone}
                {...register('phone')}
              />
              <FieldError errors={[errors.phone]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='customer-email'>Email (optional)</FieldLabel>
              <Input
                id='customer-email'
                type='email'
                placeholder='customer@example.com'
                disabled={isFormBusy}
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              <FieldError errors={[errors.email]} />
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
              {createCustomerMutation.isPending ? 'Adding customer...' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;
