import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AssignSupervisorPayload,
  CreateUserPayload,
} from '@/types/user-types';
import * as endpoints from './endpoints';
import { usersQueryKeys } from './queries';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => endpoints.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.active });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.inactive });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.scope });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
};

export const useAssignSupervisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignSupervisorPayload) =>
      endpoints.assignSupervisor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.active });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.scope });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign supervisor');
    },
  });
};
