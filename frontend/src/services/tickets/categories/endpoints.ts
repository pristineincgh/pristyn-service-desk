import { apiFetch } from '@/lib/api';
import { TicketCategory } from '@/types/ticket-types';

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
): Promise<TicketCategory> => {
  return apiFetch(`${BASE_URL}/${id}`);
};

export const createTicketCategory = async (
  data: Partial<TicketCategory>
): Promise<TicketCategory> => {
  return apiFetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};
