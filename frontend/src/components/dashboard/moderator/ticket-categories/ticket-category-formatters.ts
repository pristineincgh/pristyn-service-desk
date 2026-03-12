import type { TicketCategory } from '@/types/ticket-types';

export const formatTicketCategoryTimestamp = (value: Date | string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const getTicketCategoryInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export const matchesTicketCategorySearch = (
  category: TicketCategory,
  search: string
) => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return category.name.toLowerCase().includes(normalizedSearch);
};
