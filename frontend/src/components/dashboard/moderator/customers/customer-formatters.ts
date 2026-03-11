import type { Customer } from '@/types/customer-types';

export const formatCustomerTimestamp = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const getCustomerInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const matchesCustomerSearch = (customer: Customer, term: string) => {
  const normalizedTerm = term.trim().toLowerCase();

  if (!normalizedTerm) {
    return true;
  }

  return [customer.name, customer.email ?? '', customer.phone].some((value) =>
    value.toLowerCase().includes(normalizedTerm),
  );
};
