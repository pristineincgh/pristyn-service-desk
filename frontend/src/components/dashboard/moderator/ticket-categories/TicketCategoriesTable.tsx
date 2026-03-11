'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/tables/data-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TicketCategory } from '@/types/ticket-types';
import {
  formatTicketCategoryTimestamp,
  getTicketCategoryInitials,
} from './ticket-category-formatters';

type TicketCategoriesTableProps = {
  categories: TicketCategory[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const TicketCategoriesTable = ({
  categories,
  total,
  page,
  pageSize,
  totalPages,
  isLoading = false,
  isFetching = false,
  onPageChange,
  onPageSizeChange,
}: TicketCategoriesTableProps) => {
  const router = useRouter();

  const columns = useMemo<ColumnDef<TicketCategory>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Category',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar size='lg'>
              <AvatarFallback>
                {getTicketCategoryInitials(row.original.name)}
              </AvatarFallback>
            </Avatar>
            <div className='space-y-0.5'>
              <p className='font-medium text-foreground'>{row.original.name}</p>
              <p className='text-xs text-muted-foreground'>
                {row.original.ticketCount ?? 0} linked tickets
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'usage',
        header: 'Usage',
        cell: ({ row }) =>
          (row.original.ticketCount ?? 0) > 0 ? (
            <Badge variant='outline' className='rounded-md'>
              In use
            </Badge>
          ) : (
            <Badge variant='secondary' className='rounded-md border-0'>
              Unused
            </Badge>
          ),
      },
      {
        accessorKey: 'ticketCount',
        header: 'Tickets',
        cell: ({ row }) => row.original.ticketCount ?? 0,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatTicketCategoryTimestamp(row.original.createdAt),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => formatTicketCategoryTimestamp(row.original.updatedAt),
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={categories}
      total={total}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
      isFetching={isFetching}
      loadingMessage='Loading ticket categories...'
      emptyMessage='No ticket categories found.'
      pageSizeOptions={[10, 20, 50]}
      onRowClick={(category) =>
        router.push(
          `/dashboard/moderator/ticket-categories/${encodeURIComponent(category.id)}`
        )
      }
    />
  );
};

export default TicketCategoriesTable;
