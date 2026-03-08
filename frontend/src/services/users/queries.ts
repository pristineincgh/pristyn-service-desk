import { useQuery } from '@tanstack/react-query';
import * as endpoints from './endpoints';
import { UserDetail, UserListResponse } from '@/types/user-types';

export const usersQueryKeys = {
  all: ['users', 'all'] as const,
  active: ['users', 'active'] as const,
  inactive: ['users', 'inactive'] as const,
  scope: ['users', 'scope'] as const,
  scopeDetail: (id: string) => ['users', 'scope', id] as const,
};

export const useAllUsers = () =>
  useQuery<UserListResponse>({
    queryKey: usersQueryKeys.all,
    queryFn: endpoints.getAllUsers,
  });

export const useActiveUsers = () =>
  useQuery<UserListResponse>({
    queryKey: usersQueryKeys.active,
    queryFn: endpoints.getActiveUsers,
  });

export const useInactiveUsers = () =>
  useQuery<UserListResponse>({
    queryKey: usersQueryKeys.inactive,
    queryFn: endpoints.getInactiveUsers,
  });

export const useUsersByScope = () =>
  useQuery<UserListResponse>({
    queryKey: usersQueryKeys.scope,
    queryFn: endpoints.getUsersByScope,
  });

export const useUserDetailByScope = (id: string) =>
  useQuery<UserDetail>({
    queryKey: usersQueryKeys.scopeDetail(id),
    queryFn: () => endpoints.getUserDetailByScope(id),
    enabled: !!id,
  });
