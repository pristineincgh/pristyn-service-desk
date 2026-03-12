'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { format, isValid, parseISO } from 'date-fns';
import { DataTable } from '@/components/common/tables/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { TicketPriority, TicketShort } from '@/types/ticket-types';
import { getStatusBadge } from '@/lib/get-status-badge';

type TicketsTableProps = {
  tickets: TicketShort[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedTicketIds: string[];
  onSelectionChange: (ticketIds: string[]) => void;
};

const getPriorityFormat = (priority: TicketPriority) => {
  if (priority === TicketPriority.HIGH) {
    return 'High';
  }

  if (priority === TicketPriority.MEDIUM) {
    return 'Medium';
  }

  return 'Low';
};

const formatTimestamp = (value: string): string => {
  const date = parseISO(value);
  if (!isValid(date)) {
    return 'Unknown time';
  }

  return format(date, 'PPp');
};

const TicketsTable = ({
  tickets,
  total,
  page,
  pageSize,
  totalPages,
  isLoading = false,
  isFetching = false,
  onPageChange,
  onPageSizeChange,
  selectedTicketIds,
  onSelectionChange,
}: TicketsTableProps) => {
  const router = useRouter();
  const visibleTicketIds = useMemo(
    () => tickets.map((ticket) => ticket.id),
    [tickets]
  );
  const selectedVisibleCount = useMemo(
    () =>
      visibleTicketIds.filter((ticketId) =>
        selectedTicketIds.includes(ticketId)
      ).length,
    [visibleTicketIds, selectedTicketIds]
  );
  const allVisibleSelected =
    visibleTicketIds.length > 0 &&
    selectedVisibleCount === visibleTicketIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  const columns = useMemo<ColumnDef<TicketShort>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            aria-label='Select all tickets'
            checked={
              allVisibleSelected
                ? true
                : someVisibleSelected
                  ? 'indeterminate'
                  : false
            }
            onCheckedChange={(checked) => {
              if (checked) {
                const next = new Set(selectedTicketIds);
                visibleTicketIds.forEach((ticketId) => next.add(ticketId));
                onSelectionChange(Array.from(next));
                return;
              }

              onSelectionChange(
                selectedTicketIds.filter(
                  (ticketId) => !visibleTicketIds.includes(ticketId)
                )
              );
            }}
          />
        ),
        cell: ({ row }) => {
          const ticketId = row.original.id;
          const isChecked = selectedTicketIds.includes(ticketId);

          return (
            <div
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <Checkbox
                aria-label={`Select ${row.original.ticketNumber}`}
                checked={isChecked}
                onCheckedChange={(checked) => {
                  if (checked) {
                    if (selectedTicketIds.includes(ticketId)) {
                      return;
                    }

                    onSelectionChange([...selectedTicketIds, ticketId]);
                    return;
                  }

                  onSelectionChange(
                    selectedTicketIds.filter((id) => id !== ticketId)
                  );
                }}
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'ticketNumber',
        header: 'Ticket',
        cell: ({ row }) => (
          <div className='space-y-0.5'>
            <p className='font-medium'>{row.original.ticketNumber}</p>
            <p className='text-xs text-muted-foreground'>
              {row.original.title}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'customer.name',
        header: 'Customer',
        cell: ({ row }) => row.original.customer.name,
      },
      {
        accessorKey: 'issueType.name',
        header: 'Category',
        cell: ({ row }) => row.original.category.name,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => (
          <span>{getPriorityFormat(row.original.priority)}</span>
        ),
      },
      {
        accessorKey: 'assignedTo.name',
        header: 'Assigned To',
        cell: ({ row }) => row.original.assignedTo?.name ?? 'Unassigned',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatTimestamp(row.original.createdAt),
      },
    ],
    [
      allVisibleSelected,
      someVisibleSelected,
      onSelectionChange,
      selectedTicketIds,
      visibleTicketIds,
    ]
  );

  return (
    <DataTable
      columns={columns}
      data={tickets}
      total={total}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
      isFetching={isFetching}
      loadingMessage='Loading tickets...'
      emptyMessage='No tickets found.'
      pageSizeOptions={[10, 20, 50]}
      onRowClick={(ticket) =>
        router.push(
          `/dashboard/moderator/tickets/${encodeURIComponent(ticket.id)}`
        )
      }
    />
  );
};

export default TicketsTable;
