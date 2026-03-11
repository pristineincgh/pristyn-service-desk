import { useQuery } from '@tanstack/react-query';
import * as endpoints from './endpoints';
import {
  Customer,
  CustomerDetail,
  CustomerListResponse,
} from '@/types/customer-types';

export const customerQueryKeys = {
  all: ['customers'] as const,
  list: (search?: string) => ['customers', 'list', search ?? ''] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
};

export const useCustomersQuery = (search?: string) =>
  useQuery<CustomerListResponse>({
    queryKey: customerQueryKeys.list(search),
    queryFn: () => endpoints.getCustomers(search),
  });

export const useCustomerQuery = (id: string) =>
  useQuery<CustomerDetail>({
    queryKey: customerQueryKeys.detail(id),
    queryFn: () => endpoints.getCustomer(id),
    enabled: !!id,
  });
