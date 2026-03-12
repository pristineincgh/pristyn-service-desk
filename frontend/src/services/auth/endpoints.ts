import { apiFetch } from "@/lib/api";
import type {
  AuthUserResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "@/types/user-types";

const BASE_URL = "/api/auth";

export const getAuthUser = async (): Promise<AuthUserResponse> => {
  return apiFetch(`${BASE_URL}/me`);
};

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  return apiFetch(`${BASE_URL}/login`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
};

export const logout = async (): Promise<LogoutResponse> => {
  return apiFetch(`${BASE_URL}/logout`, {
    method: "POST",
  });
};

export const updateProfile = async (
  data: UpdateProfilePayload,
): Promise<UpdateProfileResponse> => {
  return apiFetch(`${BASE_URL}/me`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
};

export const changePassword = async (
  data: ChangePasswordPayload,
): Promise<ChangePasswordResponse> => {
  return apiFetch(`${BASE_URL}/change-password`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
};
