import { apiFetch } from '@/lib/api';
import {
  CreateTicketCategoryPayload,
  DeleteTicketCategoryResponse,
  TicketCategory,
  TicketCategoryDetail,
  UpdateTicketCategoryPayload,
  UpdateTicketCategoryResponse,
} from '@/types/ticket-types';

const BASE_URL = '/api/ticket-categories';

type TicketCategoryListApiResponse = {
  total: number;
  categories: TicketCategory[];
};

export const getTicketCategories = async (): Promise<TicketCategory[]> => {
  const response = await apiFetch<TicketCategoryListApiResponse>(BASE_URL);

  return response.categories;
};

export const getTicketCategory = async (
  id: string
): Promise<TicketCategoryDetail> => {
  return apiFetch(`${BASE_URL}/${id}`);
};

export const createTicketCategory = async (
  data: CreateTicketCategoryPayload
): Promise<TicketCategory> => {
  return apiFetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const updateTicketCategory = async (
  id: string,
  data: UpdateTicketCategoryPayload
): Promise<UpdateTicketCategoryResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const deleteTicketCategory = async (
  id: string
): Promise<DeleteTicketCategoryResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
};
