import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as endpoints from "./endpoints";
import {
  BulkDeleteTicketsPayload,
  BulkReassignTicketsPayload,
  BulkUpdateTicketStatusPayload,
  CreateTicketPayload,
  UpdateTicketPayload,
} from "@/types/ticket-types";
import { toast } from "sonner";
import { ticketQueryKeys } from "./queries";
import { activityQueryKeys } from "../activity/queries";

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketPayload) => endpoints.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: activityQueryKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create ticket");
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketPayload }) =>
      endpoints.updateTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: activityQueryKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ticket");
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => endpoints.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: activityQueryKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete ticket");
    },
  });
};

export const useBulkReassignTickets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkReassignTicketsPayload) =>
      endpoints.bulkReassignTickets(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: activityQueryKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reassign tickets");
    },
  });
};

export const useBulkUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateTicketStatusPayload) =>
      endpoints.bulkUpdateTicketStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: activityQueryKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ticket statuses");
    },
  });
};

export const useBulkDeleteTickets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkDeleteTicketsPayload) =>
      endpoints.bulkDeleteTickets(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: activityQueryKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tickets");
    },
  });
};
