import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as endpoints from './endpoints';
import {
  CreateTicketCategoryPayload,
  UpdateTicketCategoryPayload,
} from '@/types/ticket-types';
import { ticketCategoryQueryKeys } from './queries';

export const useCreateTicketCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketCategoryPayload) =>
      endpoints.createTicketCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketCategoryQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create ticket category');
    },
  });
};

export const useUpdateTicketCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTicketCategoryPayload;
    }) => endpoints.updateTicketCategory(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketCategoryQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: ticketCategoryQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update ticket category');
    },
  });
};

export const useDeleteTicketCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => endpoints.deleteTicketCategory(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ticketCategoryQueryKeys.all });
      queryClient.removeQueries({
        queryKey: ticketCategoryQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete ticket category');
    },
  });
};
