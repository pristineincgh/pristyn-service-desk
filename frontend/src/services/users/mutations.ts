import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AssignSupervisorPayload,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
} from "@/types/user-types";
import * as endpoints from "./endpoints";
import { activityQueryKeys } from "../activity/queries";

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => endpoints.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      endpoints.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserStatusPayload }) =>
      endpoints.updateUserStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user status");
    },
  });
};

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => endpoints.resetUserPassword(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset user password");
    },
  });
};

export const useAssignSupervisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignSupervisorPayload }) =>
      endpoints.assignSupervisor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign supervisor");
    },
  });
};
