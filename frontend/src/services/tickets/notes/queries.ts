import { useQuery } from '@tanstack/react-query';
import * as endpoints from './endpoints';
import { TicketNotesResponse } from '@/types/ticket-types';

export const ticketNoteQueryKeys = {
  all: ['ticket-notes'] as const,
  list: (ticketId: string) => ['ticket-notes', 'list', ticketId] as const,
};

export const useTicketNotes = (ticketId?: string) =>
  useQuery<TicketNotesResponse>({
    queryKey: ticketId ? ticketNoteQueryKeys.list(ticketId) : ticketNoteQueryKeys.all,
    queryFn: () => endpoints.getTicketNotes(ticketId as string),
    enabled: !!ticketId,
  });
