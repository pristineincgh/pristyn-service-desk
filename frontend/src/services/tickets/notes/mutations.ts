import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as endpoints from "./endpoints";
import {
  CreateTicketNotePayload,
  UpdateTicketNotePayload,
} from "@/types/ticket-types";
import { toast } from "sonner";
import { ticketNoteQueryKeys } from "./queries";
import { activityQueryKeys } from "@/services/activity/queries";
import { ticketQueryKeys } from "../queries";

export const useCreateTicketNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      data,
    }: {
      ticketId: string;
      data: CreateTicketNotePayload;
    }) => endpoints.createTicketNote(ticketId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ticketNoteQueryKeys.list(variables.ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail(variables.ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: activityQueryKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create ticket note");
    },
  });
};

export const useUpdateTicketNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      noteId,
      data,
    }: {
      ticketId: string;
      noteId: string;
      data: UpdateTicketNotePayload;
    }) => endpoints.updateTicketNote(ticketId, noteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ticketNoteQueryKeys.list(variables.ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail(variables.ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: activityQueryKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ticket note");
    },
  });
};

export const useDeleteTicketNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, noteId }: { ticketId: string; noteId: string }) =>
      endpoints.deleteTicketNote(ticketId, noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ticketNoteQueryKeys.list(variables.ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail(variables.ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: activityQueryKeys.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete ticket note");
    },
  });
};
