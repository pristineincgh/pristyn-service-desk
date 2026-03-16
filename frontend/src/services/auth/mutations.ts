import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AuthUserResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  RequestPasswordResetPayload,
  RequestPasswordResetResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SendEmailVerificationResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
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

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  return useMutation<ChangePasswordResponse, Error, ChangePasswordPayload>({
    mutationFn: (payload) => endpoints.changePassword(payload),
    onSuccess: async (response) => {
      const authResponse = await endpoints.getAuthUser();
      queryClient.setQueryData<AuthUserResponse>(authQueryKeys.currentUser, {
        user: authResponse.user,
      });
      setAuthUser(authResponse.user);
      toast.success(response.message || "Password changed successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });
};

export const useSendEmailVerification = () => {
  const queryClient = useQueryClient();

  return useMutation<SendEmailVerificationResponse, Error>({
    mutationFn: endpoints.sendEmailVerification,
    onSuccess: (response) => {
      toast.success(response.message || "Verification email sent successfully");
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send verification email");
    },
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  return useMutation<VerifyEmailResponse, Error, VerifyEmailPayload>({
    mutationFn: (payload) => endpoints.verifyEmail(payload),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });

      try {
        const authResponse = await endpoints.getAuthUser();
        queryClient.setQueryData<AuthUserResponse>(authQueryKeys.currentUser, {
          user: authResponse.user,
        });
        setAuthUser(authResponse.user);
      } catch {
        // Verification can happen from a public context without a session.
      }

      toast.success(response.message || "Email verified successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to verify email");
    },
  });
};

export const useRequestPasswordReset = () =>
  useMutation<
    RequestPasswordResetResponse,
    Error,
    RequestPasswordResetPayload
  >({
    mutationFn: (payload) => endpoints.requestPasswordReset(payload),
    onSuccess: (response) => {
      toast.success(
        response.message ||
          "If an account with that email exists, a reset link has been sent",
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to request password reset");
    },
  });

export const useResetPassword = () =>
  useMutation<ResetPasswordResponse, Error, ResetPasswordPayload>({
    mutationFn: (payload) => endpoints.resetPassword(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Password reset successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
