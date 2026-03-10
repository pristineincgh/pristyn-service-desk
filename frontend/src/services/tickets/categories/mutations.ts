import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as endpoints from './endpoints';
import { TicketCategory } from '@/types/ticket-types';

export const useCreateTicketCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TicketCategory>) =>
      endpoints.createTicketCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ticket-categories'],
      }); // refresh ticket category list
    },
  });
};
