import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  AuthUserResponse,
  LoginPayload,
  LoginResponse,
  LogoutResponse,
} from '@/types/user-types';
import * as endpoints from './endpoints';
import { authQueryKeys } from './queries';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (payload) => endpoints.login(payload),
    onSuccess: (response) => {
      queryClient.setQueryData<AuthUserResponse>(authQueryKeys.currentUser, {
        user: response.user,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log in');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation<LogoutResponse, Error>({
    mutationFn: endpoints.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.currentUser });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log out');
    },
  });
};
