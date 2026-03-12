import { apiFetch } from '@/lib/api';
import {
  AssignSupervisorPayload,
  AssignSupervisorResponse,
  CreateUserPayload,
  CreateUserResponse,
  ResetUserPasswordResponse,
  UpdateUserPayload,
  UpdateUserResponse,
  UpdateUserStatusPayload,
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
  id: string,
  data: AssignSupervisorPayload
): Promise<AssignSupervisorResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(id)}/assign-supervisor`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const updateUser = async (
  id: string,
  data: UpdateUserPayload
): Promise<UpdateUserResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const updateUserStatus = async (
  id: string,
  data: UpdateUserStatusPayload
): Promise<UpdateUserResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const resetUserPassword = async (
  id: string
): Promise<ResetUserPasswordResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(id)}/reset-password`, {
    method: 'POST',
  });
};
