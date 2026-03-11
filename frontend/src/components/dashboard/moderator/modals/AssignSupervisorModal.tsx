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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssignSupervisor } from '@/services/users/mutations';
import { useActiveUsers } from '@/services/users/queries';
import { UserRole } from '@/types/user-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

interface AssignSupervisorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const assignSupervisorSchema = z.object({
  agentId: z.string().min(1, 'Please select an agent'),
  supervisorId: z.string().min(1, 'Please select a supervisor'),
});

type AssignSupervisorFormData = z.infer<typeof assignSupervisorSchema>;

const AssignSupervisorModal = ({
  open,
  onOpenChange,
}: AssignSupervisorModalProps) => {
  const assignSupervisorMutation = useAssignSupervisor();
  const { data: activeUsersResponse, isLoading: isActiveUsersLoading } =
    useActiveUsers();

  const agents = useMemo(
    () =>
      (activeUsersResponse?.users ?? [])
        .filter((user) => user.role === UserRole.AGENT)
        .sort((left, right) => left.name.localeCompare(right.name)),
    [activeUsersResponse?.users]
  );

  const supervisors = useMemo(
    () =>
      (activeUsersResponse?.users ?? [])
        .filter((user) => user.role === UserRole.SUPERVISOR)
        .sort((left, right) => left.name.localeCompare(right.name)),
    [activeUsersResponse?.users]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignSupervisorFormData>({
    resolver: zodResolver(assignSupervisorSchema),
    defaultValues: {
      agentId: '',
      supervisorId: '',
    },
  });

  const isFormBusy =
    isSubmitting || isActiveUsersLoading || assignSupervisorMutation.isPending;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({
        agentId: '',
        supervisorId: '',
      });
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: AssignSupervisorFormData) => {
    try {
      const response = await assignSupervisorMutation.mutateAsync(data);
      toast.success(response.message || 'Supervisor assigned successfully');
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
          <DialogTitle>Assign Supervisor</DialogTitle>
          <DialogDescription>
            Link an agent to the correct supervisor for scope and oversight.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <FieldGroup>
            <Controller
              name='agentId'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Agent</FieldLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={isFormBusy}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue
                        placeholder={
                          isActiveUsersLoading
                            ? 'Loading agents...'
                            : agents.length > 0
                              ? 'Select agent'
                              : 'No agents available'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
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
                  <FieldLabel>Supervisor</FieldLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={isFormBusy}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue
                        placeholder={
                          isActiveUsersLoading
                            ? 'Loading supervisors...'
                            : supervisors.length > 0
                              ? 'Select supervisor'
                              : 'No supervisors available'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.map((supervisor) => (
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {(agents.length === 0 || supervisors.length === 0) &&
            !isActiveUsersLoading ? (
              <p className='text-sm text-muted-foreground'>
                You need at least one active agent and one active supervisor to
                create an assignment.
              </p>
            ) : null}
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
            <Button
              type='submit'
              disabled={
                isFormBusy || agents.length === 0 || supervisors.length === 0
              }
            >
              {assignSupervisorMutation.isPending
                ? 'Assigning supervisor...'
                : 'Assign Supervisor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignSupervisorModal;
