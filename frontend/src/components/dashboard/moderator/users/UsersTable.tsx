'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/tables/data-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatUserDisplayName } from '@/lib/self-reference';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { type UserRole, type UserSummary } from '@/types/user-types';
import {
  formatUserTimestamp,
  getUserInitials,
  roleBadgeClassMap,
  roleLabelMap,
  statusBadgeClassMap,
  statusLabelMap,
} from './user-formatters';

type UsersTableProps = {
  users: UserSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  isFetching?: boolean;
  roleFilter?: UserRole | '';
  supervisorLookup: Record<string, string>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const UsersTable = ({
  users,
  total,
  page,
  pageSize,
  totalPages,
  isLoading = false,
  isFetching = false,
  roleFilter,
  supervisorLookup,
  onPageChange,
  onPageSizeChange,
}: UsersTableProps) => {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.authUser);

  const columns = useMemo<ColumnDef<UserSummary>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar size='lg'>
              <AvatarFallback>
                {getUserInitials(row.original.name)}
              </AvatarFallback>
            </Avatar>
            <div className='space-y-0.5'>
              <p className='font-medium text-foreground'>
                {formatUserDisplayName(
                  row.original.name,
                  row.original.id,
                  authUser?.id
                )}
              </p>
              <p className='text-xs text-muted-foreground'>
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge
            variant='secondary'
            className={cn('border-0', roleBadgeClassMap[row.original.role])}
          >
            {roleLabelMap[row.original.role]}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant='secondary'
            className={cn('border-0', statusBadgeClassMap[row.original.status])}
          >
            {statusLabelMap[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'emailVerified',
        header: 'Verification',
        cell: ({ row }) =>
          row.original.emailVerified ? (
            <Badge variant='outline' className='rounded-md'>
              Verified
            </Badge>
          ) : (
            <Badge variant='secondary' className='rounded-md border-0'>
              Pending
            </Badge>
          ),
      },
      {
        id: 'supervisor',
        header: roleFilter === 'AGENT' ? 'Supervisor' : 'Reports to',
        cell: ({ row }) =>
          row.original.supervisorId
            ? formatUserDisplayName(
                supervisorLookup[row.original.supervisorId] ?? 'Assigned',
                row.original.supervisorId,
                authUser?.id
              )
            : 'None',
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => row.original.phone ?? 'Not provided',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatUserTimestamp(row.original.createdAt),
      },
    ],
    [roleFilter, supervisorLookup, authUser?.id],
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      total={total}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
      isFetching={isFetching}
      loadingMessage='Loading users...'
      emptyMessage='No users found.'
      pageSizeOptions={[10, 20, 50]}
      onRowClick={(user) =>
        router.push(`/dashboard/moderator/users/${encodeURIComponent(user.id)}`)
      }
    />
  );
};

export default UsersTable;
