'use client';

import { useEffect, useMemo } from 'react';
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
import { useUpdateUser } from '@/services/users/mutations';
import { useActiveUsers } from '@/services/users/queries';
import {
  UserRole,
  type UpdateUserPayload,
  type UserDetail,
} from '@/types/user-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { roleLabelMap } from './user-formatters';

interface UpdateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetail;
}

const updateUserSchema = z.object({
  name: z.string().trim().min(1, 'Please enter a name'),
  email: z.email('Please enter a valid email'),
  phone: z.string().trim().optional(),
  role: z.enum(UserRole),
  supervisorId: z.string().optional(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

const UpdateUserModal = ({
  open,
  onOpenChange,
  user,
}: UpdateUserModalProps) => {
  const updateUserMutation = useUpdateUser();
  const { data: activeUsersResponse, isLoading: isActiveUsersLoading } =
    useActiveUsers();

  const supervisors = useMemo(
    () =>
      (activeUsersResponse?.users ?? [])
        .filter(
          (candidate) =>
            candidate.role === UserRole.SUPERVISOR && candidate.id !== user.id
        )
        .sort((left, right) => left.name.localeCompare(right.name)),
    [activeUsersResponse?.users, user.id]
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
      supervisorId: user.supervisorId ?? '',
    },
  });

  const roleValue = useWatch({
    control,
    name: 'role',
  });

  const isAgentRole = roleValue === UserRole.AGENT;
  const isFormBusy = isSubmitting || updateUserMutation.isPending;

  useEffect(() => {
    reset({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
      supervisorId: user.supervisorId ?? '',
    });
  }, [reset, user]);

  useEffect(() => {
    if (isAgentRole) {
      return;
    }

    setValue('supervisorId', '', { shouldDirty: true });
  }, [isAgentRole, setValue]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isFormBusy) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        role: user.role,
        supervisorId: user.supervisorId ?? '',
      });
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: UpdateUserFormData) => {
    const payload: UpdateUserPayload = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() ? data.phone.trim() : null,
      role: data.role,
      supervisorId:
        data.role === UserRole.AGENT
          ? data.supervisorId?.trim()
            ? data.supervisorId.trim()
            : null
          : null,
    };

    try {
      const response = await updateUserMutation.mutateAsync({
        id: user.id,
        data: payload,
      });

      toast.success(response.message || 'User updated successfully');
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
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update profile details, verification state, role, and supervisor
            assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='update-user-name'>Name</FieldLabel>
              <Input
                id='update-user-name'
                disabled={isFormBusy}
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='update-user-email'>Email</FieldLabel>
              <Input
                id='update-user-email'
                type='email'
                disabled={isFormBusy}
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <div className='grid grid-cols-2 gap-4'>
              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor='update-user-phone'>Phone</FieldLabel>
                <Input
                  id='update-user-phone'
                  placeholder='Optional phone number'
                  disabled={isFormBusy}
                  aria-invalid={!!errors.phone}
                  {...register('phone')}
                />
                <FieldError errors={[errors.phone]} />
              </Field>

              <Controller
                name='role'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Role</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as UserRole)
                      }
                      disabled={isFormBusy}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(UserRole).map((role) => (
                          <SelectItem key={role} value={role}>
                            {roleLabelMap[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              name='supervisorId'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Supervisor</FieldLabel>
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
                    Supervisors can only be assigned to users with the Agent
                    role.
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
            <Button type='submit' disabled={isFormBusy || !isDirty}>
              {updateUserMutation.isPending ? 'Saving changes...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserModal;
