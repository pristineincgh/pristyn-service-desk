import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import * as endpoints from "./endpoints";
import { authQueryKeys } from "./queries";
import { activityQueryKeys } from "../activity/queries";
import { useAuthStore } from "@/store/auth-store";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (payload) => endpoints.login(payload),
    onSuccess: (response) => {
      queryClient.setQueryData<AuthUserResponse>(authQueryKeys.currentUser, {
        user: response.user,
      });
      setAuthUser(response.user);
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to log in");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearAuthUser = useAuthStore((state) => state.clearAuthUser);

  return useMutation<LogoutResponse, Error>({
    mutationFn: endpoints.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.currentUser });
      clearAuthUser();
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to log out");
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: (payload) => endpoints.updateProfile(payload),
    onSuccess: (response) => {
      queryClient.setQueryData<AuthUserResponse>(authQueryKeys.currentUser, {
        user: response.user,
      });
      setAuthUser(response.user);
      toast.success(response.message || "Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

export const useChangePassword = () =>
  useMutation<ChangePasswordResponse, Error, ChangePasswordPayload>({
    mutationFn: (payload) => endpoints.changePassword(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Password changed successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });
