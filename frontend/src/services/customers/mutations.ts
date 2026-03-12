import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as endpoints from "./endpoints";
import {
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "@/types/customer-types";
import { customerQueryKeys } from "./queries";
import { activityQueryKeys } from "../activity/queries";

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) =>
      endpoints.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create customer");
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCustomerPayload;
    }) => endpoints.updateCustomer(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: customerQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update customer");
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => endpoints.deleteCustomer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      queryClient.removeQueries({
        queryKey: customerQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete customer");
    },
  });
};
