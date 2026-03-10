import { useQuery } from '@tanstack/react-query';
import * as endpoints from './endpoints';
import { TicketDetail, TicketListResponse } from '@/types/ticket-types';

export const ticketQueryKeys = {
  all: ['tickets'] as const,
  list: (page: number, limit: number) =>
    ['tickets', 'list', page, limit] as const,
  detail: (id: string) => ['tickets', id] as const,
};

export const useTickets = (page = 1, limit = 20) =>
  useQuery<TicketListResponse>({
    queryKey: ticketQueryKeys.list(page, limit),
    queryFn: () => endpoints.getTickets(page, limit),
  });

export const useTicket = (id: string) =>
  useQuery<TicketDetail>({
    queryKey: ticketQueryKeys.detail(id),
    queryFn: () => endpoints.getTicket(id),
    enabled: !!id,
  });
