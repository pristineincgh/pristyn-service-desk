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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { useCreateCustomer } from '@/services/customers/mutations';
import { useCustomersQuery } from '@/services/customers/queries';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTicket } from '@/services/tickets/mutations';
import { useTicketCategories } from '@/services/tickets/categories/queries';
import { useUsersByScope } from '@/services/users/queries';
import { useAuthStore } from '@/store/auth-store';
import { UserShort } from '@/types/user-types';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Spinner } from '@/components/ui/spinner';

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Please enter customer name'),
  phone: z.string().trim().min(1, 'Please enter customer phone number'),
  email: z
    .union([z.email('Please enter a valid email'), z.literal('')])
    .optional(),
});

const newTicketSchema = z.object({
  title: z.string().trim().min(1, 'Please enter a title'),
  description: z.string().trim().min(1, 'Please enter a description'),
  categoryId: z.string().min(1, 'Please select a category'),
  customerId: z.string().min(1, 'Please select a customer'),
  assignedToId: z.string().optional(),
});

type NewTicketFormData = z.infer<typeof newTicketSchema>;
type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;

const formatCustomerLabel = (name: string, phone: string) =>
  `${name} (${phone})`;

const useDebouncedValue = (value: string, delayMs: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
};

const NewTicketModal = ({ open, onOpenChange }: NewTicketModalProps) => {
  const [customerSearch, setCustomerSearch] = useState('');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const ticketDialogContentRef = useRef<HTMLDivElement | null>(null);
  const debouncedCustomerSearch = useDebouncedValue(customerSearch, 300);
  const authUser = useAuthStore((state) => state.authUser);

  const createTicketMutation = useCreateTicket();
  const createCustomerMutation = useCreateCustomer();
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useTicketCategories();
  const { data: usersByScopeResponse, isLoading: isAssigneesLoading } =
    useUsersByScope();
  const {
    data: customerListResponse,
    isLoading: isCustomersLoading,
    isFetching: isCustomersFetching,
  } = useCustomersQuery(debouncedCustomerSearch);

  const customers = useMemo(
    () => customerListResponse?.customers ?? [],
    [customerListResponse?.customers]
  );
  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers]
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

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewTicketFormData>({
    resolver: zodResolver(newTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      customerId: '',
      assignedToId: authUser?.id ?? '',
    },
  });

  const {
    register: registerCustomer,
    handleSubmit: handleCreateCustomerSubmit,
    setValue: setCreateCustomerValue,
    formState: {
      errors: createCustomerErrors,
      isSubmitting: isCustomerSubmitting,
    },
    reset: resetCreateCustomerForm,
  } = useForm<CreateCustomerFormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
    },
  });

  const isFormBusy =
    isSubmitting ||
    createTicketMutation.isPending ||
    isCustomerSubmitting ||
    createCustomerMutation.isPending;
  const isInitialCustomersLoading =
    isCustomersLoading && customerSearch.trim().length === 0;
  const isLookupLoading =
    isCategoriesLoading || isAssigneesLoading || isInitialCustomersLoading;

  const resetModalState = () => {
    reset({
      title: '',
      description: '',
      categoryId: '',
      customerId: '',
      assignedToId: authUser?.id ?? '',
    });
    resetCreateCustomerForm({
      name: '',
      phone: '',
      email: '',
    });
    setCustomerSearch('');
    setIsAddCustomerModalOpen(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetModalState();
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: NewTicketFormData) => {
    try {
      const response = await createTicketMutation.mutateAsync({
        title: data.title.trim(),
        description: data.description.trim(),
        categoryId: data.categoryId,
        customerId: data.customerId,
        ...(data.assignedToId?.trim()
          ? { assignedToId: data.assignedToId.trim() }
          : {}),
      });

      toast.success(
        response.ticket.ticketNumber
          ? `Ticket ${response.ticket.ticketNumber} created successfully`
          : response.message || 'Ticket created successfully'
      );
      handleDialogOpenChange(false);
    } catch {
      // Error toast is handled in mutation hook.
    }
  };

  const openAddCustomerModal = () => {
    const normalizedSearch = customerSearch.trim();

    setIsAddCustomerModalOpen(true);
    resetCreateCustomerForm({
      name: '',
      phone: '',
      email: '',
    });

    if (normalizedSearch.length === 0) {
      return;
    }

    if (/\d/.test(normalizedSearch)) {
      setCreateCustomerValue('phone', normalizedSearch, { shouldDirty: true });
      return;
    }

    setCreateCustomerValue('name', normalizedSearch, { shouldDirty: true });
  };

  const handleCreateCustomer = async (data: CreateCustomerFormData) => {
    try {
      const response = await createCustomerMutation.mutateAsync({
        name: data.name.trim(),
        phone: data.phone.trim(),
        ...(data.email?.trim() ? { email: data.email.trim() } : {}),
      });

      const createdCustomer = response.customer;
      const nextLabel = createdCustomer.name;

      setCustomerSearch(nextLabel);
      setIsAddCustomerModalOpen(false);
      resetCreateCustomerForm({
        name: '',
        phone: '',
        email: '',
      });
      setValue('customerId', createdCustomer.id, {
        shouldDirty: true,
        shouldValidate: true,
      });

      toast.success(response.message || 'Customer created successfully');
    } catch {
      // Error toast is handled in mutation hook.
    }
  };

  useEffect(() => {
    if (!open || !authUser?.id) {
      return;
    }

    const currentAssigneeId = getValues('assignedToId');
    if (currentAssigneeId?.trim()) {
      return;
    }

    setValue('assignedToId', authUser.id, { shouldDirty: false });
  }, [authUser?.id, getValues, open, setValue]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          ref={ticketDialogContentRef}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(event) => {
            const target = event.target as HTMLElement | null;
            const isComboboxContentClick = target?.closest(
              '[data-slot="combobox-content"]'
            );

            if (isComboboxContentClick || isFormBusy) {
              event.preventDefault();
            }
          }}
          className='sm:max-w-2xl'
        >
          <DialogHeader>
            <DialogTitle>New Ticket</DialogTitle>
            <DialogDescription>
              Create a ticket to track and resolve customer issue.
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
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
              <FieldGroup>
                <Field data-invalid={!!errors.title}>
                  <FieldLabel htmlFor='ticket-title'>Title</FieldLabel>
                  <Input
                    id='ticket-title'
                    placeholder='Short summary of the issue'
                    disabled={isFormBusy}
                    aria-invalid={!!errors.title}
                    {...register('title')}
                  />
                  <FieldError errors={[errors.title]} />
                </Field>

                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor='ticket-description'>
                    Description
                  </FieldLabel>
                  <Textarea
                    id='ticket-description'
                    placeholder='Describe the issue in detail'
                    disabled={isFormBusy}
                    aria-invalid={!!errors.description}
                    {...register('description')}
                  />
                  <FieldError errors={[errors.description]} />
                </Field>

                <div className='grid grid-cols-5 gap-5'>
                  <div className='col-span-2'>
                    <Controller
                      name='categoryId'
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>Category</FieldLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                            disabled={isFormBusy || isCategoriesLoading}
                          >
                            <SelectTrigger
                              className='w-full'
                              disabled={categories.length === 0}
                            >
                              <SelectValue
                                placeholder={
                                  isCategoriesLoading
                                    ? 'Loading categories...'
                                    : categories.length > 0
                                      ? 'Select category'
                                      : 'No categories'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  </div>
                  <div className='col-span-3'>
                    <Controller
                      name='assignedToId'
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>Assign To</FieldLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                            disabled={isFormBusy || isAssigneesLoading}
                          >
                            <SelectTrigger className='w-full'>
                              <SelectValue
                                placeholder={
                                  isAssigneesLoading
                                    ? 'Loading users...'
                                    : 'Select assignee'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {assignees.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                  {authUser?.id === user.id ? ' (You)' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  </div>
                  <div className='col-span-5'>
                    <Controller
                      name='customerId'
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>Customer</FieldLabel>
                          <Combobox<string>
                            items={customers.map((customer) => customer.id)}
                            value={field.value || null}
                            onValueChange={(value) => {
                              field.onChange(value ?? '');

                              if (!value) {
                                setCustomerSearch('');
                                return;
                              }

                              const customer = customerById.get(value);
                              if (!customer) {
                                return;
                              }

                              setCustomerSearch(customer.name);
                            }}
                            inputValue={customerSearch}
                            onInputValueChange={(value, eventDetails) => {
                              setCustomerSearch(value);

                              const selectedCustomer = field.value
                                ? customerById.get(field.value)
                                : undefined;
                              const selectedCustomerLabel = selectedCustomer
                                ? selectedCustomer.name
                                : '';
                              const selectedCustomerFormattedLabel =
                                selectedCustomer
                                  ? formatCustomerLabel(
                                      selectedCustomer.name,
                                      selectedCustomer.phone
                                    )
                                  : '';
                              const isSelectionText =
                                value === selectedCustomerLabel ||
                                value === selectedCustomerFormattedLabel;

                              if (isSelectionText) {
                                return;
                              }

                              if (
                                eventDetails.reason === 'input-change' ||
                                eventDetails.reason === 'input-clear' ||
                                eventDetails.reason === 'clear-press'
                              ) {
                                field.onChange('');
                              }
                            }}
                            itemToStringLabel={(id) => {
                              const customer = customerById.get(id);

                              if (!customer) {
                                return id;
                              }

                              return formatCustomerLabel(
                                customer.name,
                                customer.phone
                              );
                            }}
                            itemToStringValue={(id) => id}
                          >
                            <ComboboxInput
                              placeholder='Search customer by name or phone'
                              className='w-full'
                              showClear
                              disabled={isFormBusy}
                            />
                            <ComboboxContent
                              portalContainer={ticketDialogContentRef}
                            >
                              <ComboboxList>
                                <ComboboxEmpty className='flex-col gap-2 px-3 py-3'>
                                  <span>No customer found.</span>
                                  <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onPointerDown={(event) => {
                                      event.preventDefault();
                                      openAddCustomerModal();
                                    }}
                                    onMouseDown={(event) => {
                                      event.preventDefault();
                                    }}
                                    onClick={openAddCustomerModal}
                                    disabled={isFormBusy}
                                  >
                                    Add customer
                                  </Button>
                                </ComboboxEmpty>
                                {customers.map((customer) => (
                                  <ComboboxItem
                                    key={customer.id}
                                    value={customer.id}
                                    onMouseDown={(event) => {
                                      event.preventDefault();
                                    }}
                                    onClick={() => {
                                      field.onChange(customer.id);
                                      setCustomerSearch(
                                        formatCustomerLabel(
                                          customer.name,
                                          customer.phone
                                        )
                                      );
                                    }}
                                  >
                                    <div className='flex flex-col gap-0.5'>
                                      <span className='font-medium'>
                                        {customer.name}
                                      </span>
                                      <span className='text-xs text-muted-foreground'>
                                        {customer.phone}
                                        {customer.email
                                          ? ` • ${customer.email}`
                                          : ''}
                                      </span>
                                    </div>
                                  </ComboboxItem>
                                ))}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                          {(isCustomersLoading || isCustomersFetching) && (
                            <p className='text-xs text-muted-foreground'>
                              Searching customers...
                            </p>
                          )}
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  </div>
                </div>
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
                  {createTicketMutation.isPending
                    ? 'Creating ticket...'
                    : 'Create Ticket'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddCustomerModalOpen}
        onOpenChange={(nextOpen) => {
          setIsAddCustomerModalOpen(nextOpen);

          if (!nextOpen) {
            resetCreateCustomerForm({
              name: '',
              phone: '',
              email: '',
            });
          }
        }}
      >
        <DialogContent
          className='sm:max-w-lg'
          onInteractOutside={(e) => {
            if (isFormBusy) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Create a customer to link with this ticket.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateCustomerSubmit(handleCreateCustomer)}
            className='space-y-4'
          >
            <Field data-invalid={!!createCustomerErrors.name}>
              <FieldLabel htmlFor='new-customer-name'>Name</FieldLabel>
              <Input
                id='new-customer-name'
                placeholder='Customer full name'
                disabled={isFormBusy}
                aria-invalid={!!createCustomerErrors.name}
                {...registerCustomer('name')}
              />
              <FieldError errors={[createCustomerErrors.name]} />
            </Field>

            <Field data-invalid={!!createCustomerErrors.phone}>
              <FieldLabel htmlFor='new-customer-phone'>Phone</FieldLabel>
              <Input
                id='new-customer-phone'
                placeholder='Phone number'
                disabled={isFormBusy}
                aria-invalid={!!createCustomerErrors.phone}
                {...registerCustomer('phone')}
              />
              <FieldError errors={[createCustomerErrors.phone]} />
            </Field>

            <Field data-invalid={!!createCustomerErrors.email}>
              <FieldLabel htmlFor='new-customer-email'>
                Email (optional)
              </FieldLabel>
              <Input
                id='new-customer-email'
                type='email'
                placeholder='customer@example.com'
                disabled={isFormBusy}
                aria-invalid={!!createCustomerErrors.email}
                {...registerCustomer('email')}
              />
              <FieldError errors={[createCustomerErrors.email]} />
            </Field>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsAddCustomerModalOpen(false)}
                disabled={isFormBusy}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isFormBusy}>
                {createCustomerMutation.isPending
                  ? 'Adding customer...'
                  : 'Add and Select Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default NewTicketModal;
