import { useQuery } from '@tanstack/react-query';
import * as endpoints from './endpoints';
import { TicketCategory, TicketCategoryDetail } from '@/types/ticket-types';

export const ticketCategoryQueryKeys = {
  all: ['ticket-categories'] as const,
  detail: (id: string) => ['ticket-category', id] as const,
};

export const useTicketCategories = () =>
  useQuery<TicketCategory[]>({
    queryKey: ticketCategoryQueryKeys.all,
    queryFn: endpoints.getTicketCategories,
  });

export const useTicketCategory = (id: string) =>
  useQuery<TicketCategoryDetail>({
    queryKey: ticketCategoryQueryKeys.detail(id),
    queryFn: () => endpoints.getTicketCategory(id),
    enabled: !!id,
  });
