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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssignSupervisor, useCreateUser } from '@/services/users/mutations';
import { useActiveUsers } from '@/services/users/queries';
import { UserRole } from '@/types/user-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

interface AddNewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const addNewUserSchema = z.object({
  name: z.string().trim().min(1, 'Please enter a name'),
  email: z.email('Please enter a valid email'),
  role: z.enum(UserRole),
  supervisorId: z.string().optional(),
});

type AddNewUserFormData = z.infer<typeof addNewUserSchema>;

const roleLabelMap: Record<UserRole, string> = {
  [UserRole.AGENT]: 'Agent',
  [UserRole.SUPERVISOR]: 'Supervisor',
  [UserRole.MODERATOR]: 'Moderator',
};

const AddNewUserModal = ({ open, onOpenChange }: AddNewUserModalProps) => {
  const createUserMutation = useCreateUser();
  const assignSupervisorMutation = useAssignSupervisor();
  const { data: activeUsersResponse, isLoading: isActiveUsersLoading } =
    useActiveUsers();

  const supervisors = useMemo(
    () =>
      (activeUsersResponse?.users ?? [])
        .filter((user) => user.role === UserRole.SUPERVISOR)
        .sort((first, second) => first.name.localeCompare(second.name)),
    [activeUsersResponse?.users]
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddNewUserFormData>({
    resolver: zodResolver(addNewUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: UserRole.AGENT,
      supervisorId: '',
    },
  });

  const roleValue = useWatch({
    control,
    name: 'role',
  });
  const isAgentRole = roleValue === UserRole.AGENT;

  const isFormBusy =
    isSubmitting ||
    createUserMutation.isPending ||
    assignSupervisorMutation.isPending;

  useEffect(() => {
    if (isAgentRole) {
      return;
    }

    setValue('supervisorId', '', { shouldDirty: true });
  }, [isAgentRole, setValue]);

  const resetModalState = () => {
    reset({
      name: '',
      email: '',
      role: UserRole.AGENT,
      supervisorId: '',
    });
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetModalState();
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: AddNewUserFormData) => {
    try {
      const createResponse = await createUserMutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim(),
        role: data.role,
      });

      const hasSupervisorSelection =
        data.role === UserRole.AGENT && Boolean(data.supervisorId?.trim());

      if (hasSupervisorSelection) {
        try {
          await assignSupervisorMutation.mutateAsync({
            id: createResponse.user.id,
            data: {
              supervisorId: data.supervisorId!.trim(),
            },
          });

          toast.success('User created and assigned to supervisor successfully');
          handleDialogOpenChange(false);
          return;
        } catch {
          toast.warning(
            'User created, but assigning supervisor failed. Please assign supervisor later.'
          );
          handleDialogOpenChange(false);
          return;
        }
      }

      toast.success(createResponse.message || 'User created successfully');
      handleDialogOpenChange(false);
    } catch {
      // Error toast is handled in mutation hook.
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
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a user account and optionally assign a supervisor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='new-user-name'>Name</FieldLabel>
              <Input
                id='new-user-name'
                placeholder='John Doe'
                disabled={isFormBusy}
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='new-user-email'>Email</FieldLabel>
              <Input
                id='new-user-email'
                type='email'
                placeholder='john.doe@example.com'
                disabled={isFormBusy}
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Controller
              name='role'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as UserRole)}
                    disabled={isFormBusy}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.AGENT}>
                        {roleLabelMap[UserRole.AGENT]}
                      </SelectItem>
                      <SelectItem value={UserRole.SUPERVISOR}>
                        {roleLabelMap[UserRole.SUPERVISOR]}
                      </SelectItem>
                      <SelectItem value={UserRole.MODERATOR}>
                        {roleLabelMap[UserRole.MODERATOR]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name='supervisorId'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Supervisor (Optional)</FieldLabel>
                  <Select
                    value={field.value || '__none__'}
                    onValueChange={(value) => {
                      field.onChange(value === '__none__' ? '' : value);
                    }}
                    disabled={
                      isFormBusy || isActiveUsersLoading || !isAgentRole
                    }
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue
                        placeholder={
                          !isAgentRole
                            ? 'Only available for Agent role'
                            : isActiveUsersLoading
                              ? 'Loading supervisors...'
                              : 'Select supervisor'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='__none__'>No supervisor</SelectItem>
                      {supervisors.map((supervisor) => (
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Optional assignment applies only when role is Agent.
                  </FieldDescription>
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
              {createUserMutation.isPending ||
              assignSupervisorMutation.isPending
                ? 'Creating user...'
                : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default AddNewUserModal;
