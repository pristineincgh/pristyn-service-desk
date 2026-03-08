import { apiFetch } from '@/lib/api';
import type {
  AuthUserResponse,
  LoginPayload,
  LoginResponse,
  LogoutResponse,
} from '@/types/user-types';

const BASE_URL = '/api/auth';

export const getAuthUser = async (): Promise<AuthUserResponse> => {
  return apiFetch(`${BASE_URL}/me`);
};

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  return apiFetch(`${BASE_URL}/login`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const logout = async (): Promise<LogoutResponse> => {
  return apiFetch(`${BASE_URL}/logout`, {
    method: 'POST',
  });
};
