'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import {
  type Row,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
  isFetching?: boolean;
  onRowClick?: (row: TData) => void;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];
type PaginationToken = number | 'ellipsis-left' | 'ellipsis-right';

const buildPaginationTokens = (
  currentPage: number,
  totalPages: number
): PaginationToken[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-right', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis-left',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'ellipsis-left',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis-right',
    totalPages,
  ];
};

export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  emptyMessage = 'No results.',
  loadingMessage = 'Loading data...',
  isLoading = false,
  isFetching = false,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.max(totalPages, 1),
    state: {
      pagination: {
        pageIndex: Math.max(page - 1, 0),
        pageSize,
      },
    },
  });

  const startRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = total === 0 ? 0 : Math.min(page * pageSize, total);
  const normalizedTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 1), normalizedTotalPages);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < normalizedTotalPages;
  const paginationTokens = buildPaginationTokens(
    currentPage,
    normalizedTotalPages
  );

  const handlePageClick =
    (nextPage: number) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (isLoading) {
        return;
      }

      const boundedPage = Math.min(Math.max(nextPage, 1), normalizedTotalPages);
      if (boundedPage !== currentPage) {
        onPageChange(boundedPage);
      }
    };

  const handleRowKeyDown =
    (row: Row<TData>) => (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (!onRowClick) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onRowClick(row.original);
      }
    };

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {loadingMessage}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  onKeyDown={handleRowKeyDown(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'link' : undefined}
                  className={
                    onRowClick
                      ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Showing {startRow}-{endRow} of {total}
          {isFetching ? ' (refreshing...)' : ''}
        </p>

        <div className='flex items-center gap-2'>
          {onPageSizeChange ? (
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className='w-30'>
                <SelectValue placeholder='Page size' />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <Pagination className='mx-0 w-auto justify-end'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href='#'
                  onClick={handlePageClick(currentPage - 1)}
                  aria-disabled={!canGoPrevious || isLoading}
                  tabIndex={!canGoPrevious || isLoading ? -1 : undefined}
                  className={
                    !canGoPrevious || isLoading
                      ? 'pointer-events-none opacity-50'
                      : undefined
                  }
                />
              </PaginationItem>

              {paginationTokens.map((token, index) => {
                if (token === 'ellipsis-left' || token === 'ellipsis-right') {
                  return (
                    <PaginationItem key={`${token}-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={token}>
                    <PaginationLink
                      href='#'
                      isActive={token === currentPage}
                      onClick={handlePageClick(token)}
                    >
                      {token}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href='#'
                  onClick={handlePageClick(currentPage + 1)}
                  aria-disabled={!canGoNext || isLoading}
                  tabIndex={!canGoNext || isLoading ? -1 : undefined}
                  className={
                    !canGoNext || isLoading
                      ? 'pointer-events-none opacity-50'
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
