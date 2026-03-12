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
import { useUpdateCustomer } from '@/services/customers/mutations';
import type { Customer, UpdateCustomerPayload } from '@/types/customer-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type UpdateCustomerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
};

const updateCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Please enter customer name'),
  phone: z.string().trim().min(1, 'Please enter customer phone number'),
  email: z
    .union([z.email('Please enter a valid email'), z.literal('')])
    .optional(),
});

type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;

const UpdateCustomerModal = ({
  open,
  onOpenChange,
  customer,
}: UpdateCustomerModalProps) => {
  const updateCustomerMutation = useUpdateCustomer();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateCustomerFormData>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? '',
    },
  });

  const isFormBusy = isSubmitting || updateCustomerMutation.isPending;

  useEffect(() => {
    reset({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? '',
    });
  }, [customer, reset]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isFormBusy) {
      reset({
        name: customer.name,
        phone: customer.phone,
        email: customer.email ?? '',
      });
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: UpdateCustomerFormData) => {
    const payload: UpdateCustomerPayload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() ? data.email.trim() : '',
    };

    try {
      const response = await updateCustomerMutation.mutateAsync({
        id: customer.id,
        payload,
      });

      toast.success(response.message || 'Customer updated successfully');
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
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update contact details for this customer record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='update-customer-name'>Name</FieldLabel>
              <Input
                id='update-customer-name'
                disabled={isFormBusy}
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor='update-customer-phone'>Phone</FieldLabel>
              <Input
                id='update-customer-phone'
                disabled={isFormBusy}
                aria-invalid={!!errors.phone}
                {...register('phone')}
              />
              <FieldError errors={[errors.phone]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='update-customer-email'>
                Email (optional)
              </FieldLabel>
              <Input
                id='update-customer-email'
                type='email'
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
            <Button type='submit' disabled={isFormBusy || !isDirty}>
              {updateCustomerMutation.isPending ? 'Saving changes...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCustomerModal;
