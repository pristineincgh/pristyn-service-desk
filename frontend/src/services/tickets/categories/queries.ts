import { useQuery } from '@tanstack/react-query';
import * as endpoints from './endpoints';
import { TicketCategory } from '@/types/ticket-types';

export const useTicketCategories = () =>
  useQuery<TicketCategory[]>({
    queryKey: ['ticket-categories'],
    queryFn: endpoints.getTicketCategories,
  });

export const useTicketCategory = (id: string) =>
  useQuery<TicketCategory>({
    queryKey: ['ticket-category', id],
    queryFn: () => endpoints.getTicketCategory(id),
    enabled: !!id,
  });
