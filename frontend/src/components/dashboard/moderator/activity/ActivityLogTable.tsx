'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/tables/data-table';
import type {
  ActivityLogItem,
  ActivityEntityType,
} from '@/types/activity-types';
import {
  ActivityActionBadge,
  ActivityEntityBadge,
  formatActivityRelativeTimestamp,
  formatActivityTimestamp,
  getActivityActorLabel,
  getActivityDetails,
  getActivitySubjectLabel,
  getActivitySubjectSubLabel,
} from './activity-formatters';

type ActivityLogTableProps = {
  activities: ActivityLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const ActivityLogTable = ({
  activities,
  total,
  page,
  pageSize,
  totalPages,
  isLoading = false,
  isFetching = false,
  onPageChange,
  onPageSizeChange,
}: ActivityLogTableProps) => {
  const columns = useMemo<ColumnDef<ActivityLogItem>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'When',
        cell: ({ row }) => (
          <div className='space-y-0.5'>
            <p className='font-medium text-foreground'>
              {formatActivityRelativeTimestamp(row.original.createdAt)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {formatActivityTimestamp(row.original.createdAt)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <ActivityActionBadge action={row.original.action} />,
      },
      {
        id: 'actor',
        header: 'Actor',
        cell: ({ row }) => (
          <div className='space-y-0.5'>
            <p className='font-medium text-foreground'>
              {getActivityActorLabel(row.original)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {row.original.actor?.role ?? 'SYSTEM'}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'entityType',
        header: 'Entity',
        cell: ({ row }) => (
          <ActivityEntityBadge entityType={row.original.entityType} />
        ),
      },
      {
        id: 'subject',
        header: 'Subject',
        cell: ({ row }) => (
          <div className='space-y-0.5'>
            <p className='font-medium text-foreground'>
              {getActivitySubjectLabel(row.original)}
            </p>
            {row.original.entityType === 'TICKET' ? (
              <p className='text-sm text-muted-foreground'>
                {getActivitySubjectSubLabel(row.original)}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'details',
        header: 'Details',
        cell: ({ row }) => (
          <p className='max-w-lg text-sm text-muted-foreground'>
            {getActivityDetails(row.original)}
          </p>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={activities}
      total={total}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
      isFetching={isFetching}
      loadingMessage='Loading activity log...'
      emptyMessage='No activity matches the current filters.'
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
};

export default ActivityLogTable;
