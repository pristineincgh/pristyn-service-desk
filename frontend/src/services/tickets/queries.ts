import { useQuery } from '@tanstack/react-query';
import * as endpoints from './endpoints';
import {
  TicketDetail,
  TicketListFilters,
  TicketListResponse,
} from '@/types/ticket-types';

export const ticketQueryKeys = {
  all: ['tickets'] as const,
  list: (page: number, limit: number, filters: TicketListFilters) =>
    ['tickets', 'list', page, limit, filters] as const,
  detail: (id: string) => ['tickets', id] as const,
};

export const useTickets = (
  page = 1,
  limit = 20,
  filters: TicketListFilters = {}
) =>
  useQuery<TicketListResponse>({
    queryKey: ticketQueryKeys.list(page, limit, filters),
    queryFn: () => endpoints.getTickets(page, limit, filters),
  });

export const useTicket = (id: string) =>
  useQuery<TicketDetail>({
    queryKey: ticketQueryKeys.detail(id),
    queryFn: () => endpoints.getTicket(id),
    enabled: !!id,
  });
