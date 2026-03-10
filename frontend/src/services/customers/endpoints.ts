import { apiFetch } from '@/lib/api';
import {
  CreateCustomerPayload,
  CreateCustomerResponse,
  Customer,
  CustomerListResponse,
  DeleteCustomerResponse,
  UpdateCustomerPayload,
  UpdateCustomerResponse,
} from '@/types/customer-types';

const BASE_URL = '/api/customers';

export const getCustomers = async (
  search?: string
): Promise<CustomerListResponse> => {
  const query = search
    ? `?${new URLSearchParams({ search }).toString()}`
    : '';

  return apiFetch(`${BASE_URL}${query}`);
};

export const getCustomer = async (id: string): Promise<Customer> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`);
};

export const createCustomer = async (
  data: CreateCustomerPayload
): Promise<CreateCustomerResponse> => {
  return apiFetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const updateCustomer = async (
  id: string,
  data: UpdateCustomerPayload
): Promise<UpdateCustomerResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const deleteCustomer = async (
  id: string
): Promise<DeleteCustomerResponse> => {
  return apiFetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
};
