'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/tables/data-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Customer } from '@/types/customer-types';
import {
  formatCustomerTimestamp,
  getCustomerInitials,
} from './customer-formatters';

type CustomersTableProps = {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const CustomersTable = ({
  customers,
  total,
  page,
  pageSize,
  totalPages,
  isLoading = false,
  isFetching = false,
  onPageChange,
  onPageSizeChange,
}: CustomersTableProps) => {
  const router = useRouter();

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Customer',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar size='lg'>
              <AvatarFallback>
                {getCustomerInitials(row.original.name)}
              </AvatarFallback>
            </Avatar>
            <div className='space-y-0.5'>
              <p className='font-medium text-foreground'>{row.original.name}</p>
              <p className='text-xs text-muted-foreground'>
                {row.original.email ?? 'No email on file'}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.original.email ?? 'Not provided',
      },
      {
        id: 'contact',
        header: 'Contact status',
        cell: ({ row }) =>
          row.original.email ? (
            <Badge variant='outline' className='rounded-md'>
              Email and phone
            </Badge>
          ) : (
            <Badge variant='secondary' className='rounded-md border-0'>
              Phone only
            </Badge>
          ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatCustomerTimestamp(row.original.createdAt),
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={customers}
      total={total}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
      isFetching={isFetching}
      loadingMessage='Loading customers...'
      emptyMessage='No customers found.'
      pageSizeOptions={[10, 20, 50]}
      onRowClick={(customer) =>
        router.push(
          `/dashboard/moderator/customers/${encodeURIComponent(customer.id)}`
        )
      }
    />
  );
};

export default CustomersTable;
