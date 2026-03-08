import { apiFetch } from '@/lib/api';
import {
  AssignSupervisorPayload,
  AssignSupervisorResponse,
  CreateUserPayload,
  CreateUserResponse,
  UserDetail,
  UserListResponse,
} from '@/types/user-types';

const BASE_URL = '/api/users';

export const getAllUsers = async (): Promise<UserListResponse> => {
  return apiFetch(`${BASE_URL}/all`);
};

export const getActiveUsers = async (): Promise<UserListResponse> => {
  return apiFetch(`${BASE_URL}/active`);
};

export const getInactiveUsers = async (): Promise<UserListResponse> => {
  return apiFetch(`${BASE_URL}/inactive`);
};

export const getUsersByScope = async (): Promise<UserListResponse> => {
  return apiFetch(`${BASE_URL}/scope`);
};

export const getUserDetailByScope = async (id: string): Promise<UserDetail> => {
  return apiFetch(`${BASE_URL}/scope/${encodeURIComponent(id)}`);
};

export const createUser = async (
  data: CreateUserPayload
): Promise<CreateUserResponse> => {
  return apiFetch(`${BASE_URL}/create-user`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const assignSupervisor = async (
  data: AssignSupervisorPayload
): Promise<AssignSupervisorResponse> => {
  return apiFetch(`${BASE_URL}/assign-supervisor`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};
