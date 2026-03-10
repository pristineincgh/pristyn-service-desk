import { apiFetch } from '@/lib/api';
import {
  BulkDeleteTicketsPayload,
  BulkReassignTicketsPayload,
  BulkTicketsMutationResponse,
  BulkUpdateTicketStatusPayload,
  CreateNewTicketResponse,
  CreateTicketPayload,
  DeleteTicketResponse,
  TicketDetail,
  TicketNote,
  TicketPriority,
  TicketListResponse,
  TicketSlaSnapshot,
  TicketShort,
  UpdateTicketPayload,
  UpdateTicketResponse,
} from '@/types/ticket-types';

const BASE_URL = '/api/tickets';

type TicketApiRecord = Omit<TicketDetail, 'category'> & {
  category?: TicketShort['category'];
  ticketCategory?: TicketShort['category'];
  sla?: TicketSlaSnapshot;
  notes?: TicketNote[];
};

type TicketListApiResponse = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  tickets: TicketApiRecord[];
};

type TicketMutationApiResponse = {
  message: string;
  ticket: TicketApiRecord;
};

const normalizeTicket = (ticket: TicketApiRecord): TicketDetail => ({
  ...ticket,
  category: ticket.category ?? ticket.ticketCategory ?? { id: '', name: '' },
  notes: ticket.notes ?? [],
  sla:
    ticket.sla ??
    (() => {
      const calculatedAtMs = Date.now();
      const targetHoursByPriority: Record<TicketPriority, number> = {
        [TicketPriority.HIGH]: 24,
        [TicketPriority.MEDIUM]: 48,
        [TicketPriority.LOW]: 72,
      };
      const targetHours = targetHoursByPriority[ticket.priority];
      const deadlineMs =
        new Date(ticket.createdAt).getTime() + targetHours * 60 * 60 * 1000;
      const remainingMs = deadlineMs - calculatedAtMs;

      const isActive =
        ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS';

      return {
        targetHours,
        atRiskWindowHours: 6,
        deadlineAt: new Date(deadlineMs).toISOString(),
        calculatedAt: new Date(calculatedAtMs).toISOString(),
        remainingMs,
        remainingHours: remainingMs / (60 * 60 * 1000),
        breached: isActive && remainingMs < 0,
        atRisk:
          isActive && remainingMs >= 0 && remainingMs <= 6 * 60 * 60 * 1000,
        state: !isActive
          ? 'COMPLETED'
          : remainingMs < 0
            ? 'BREACHED'
            : remainingMs <= 6 * 60 * 60 * 1000
              ? 'AT_RISK'
              : 'ON_TRACK',
      };
    })(),
});

export const getTickets = async (
  page = 1,
  limit = 20
): Promise<TicketListResponse> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();

  const response = await apiFetch<TicketListApiResponse>(`${BASE_URL}?${query}`);

  return {
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
    hasNextPage: response.hasNextPage,
    hasPrevPage: response.hasPrevPage,
    tickets: response.tickets.map(normalizeTicket),
  };
};

export const getTicket = async (id: string): Promise<TicketDetail> => {
  const ticket = await apiFetch<TicketApiRecord>(
    `${BASE_URL}/${encodeURIComponent(id)}`
  );

  return normalizeTicket(ticket);
};

export const createTicket = async (
  data: CreateTicketPayload
): Promise<CreateNewTicketResponse> => {
  const response = await apiFetch<TicketMutationApiResponse>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });

  return {
    message: response.message,
    ticket: normalizeTicket(response.ticket),
  };
};

export const updateTicket = async (
  id: string,
  data: UpdateTicketPayload
): Promise<UpdateTicketResponse> => {
  const response = await apiFetch<TicketMutationApiResponse>(
    `${BASE_URL}/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return {
    message: response.message,
    ticket: normalizeTicket(response.ticket),
  };
};

export const deleteTicket = async (id: string): Promise<DeleteTicketResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
};

export const bulkReassignTickets = async (
  data: BulkReassignTicketsPayload
): Promise<BulkTicketsMutationResponse> => {
  return apiFetch(`${BASE_URL}/bulk/reassign`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const bulkUpdateTicketStatus = async (
  data: BulkUpdateTicketStatusPayload
): Promise<BulkTicketsMutationResponse> => {
  return apiFetch(`${BASE_URL}/bulk/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const bulkDeleteTickets = async (
  data: BulkDeleteTicketsPayload
): Promise<BulkTicketsMutationResponse> => {
  return apiFetch(`${BASE_URL}/bulk`, {
    method: 'DELETE',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};
