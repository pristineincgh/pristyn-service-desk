import { useQuery } from '@tanstack/react-query';
import type { AuthUserResponse } from '@/types/user-types';
import * as endpoints from './endpoints';

export const authQueryKeys = {
  currentUser: ['auth', 'me'] as const,
};

export const useAuthUserQuery = (enabled = true) =>
  useQuery<AuthUserResponse>({
    queryKey: authQueryKeys.currentUser,
    queryFn: endpoints.getAuthUser,
    enabled,
    retry: false,
  });
