import { apiFetch } from '@/lib/api';
import {
  CreateTicketNotePayload,
  DeleteTicketNoteResponse,
  TicketNoteMutationResponse,
  TicketNotesResponse,
  UpdateTicketNotePayload,
} from '@/types/ticket-types';

const BASE_URL = '/api/tickets';

export const getTicketNotes = async (
  ticketId: string
): Promise<TicketNotesResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(ticketId)}/notes`);
};

export const createTicketNote = async (
  ticketId: string,
  data: CreateTicketNotePayload
): Promise<TicketNoteMutationResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(ticketId)}/notes`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const updateTicketNote = async (
  ticketId: string,
  noteId: string,
  data: UpdateTicketNotePayload
): Promise<TicketNoteMutationResponse> => {
  return apiFetch(
    `${BASE_URL}/${encodeURIComponent(ticketId)}/notes/${encodeURIComponent(noteId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const deleteTicketNote = async (
  ticketId: string,
  noteId: string
): Promise<DeleteTicketNoteResponse> => {
  return apiFetch(
    `${BASE_URL}/${encodeURIComponent(ticketId)}/notes/${encodeURIComponent(noteId)}`,
    {
      method: 'DELETE',
    }
  );
};
