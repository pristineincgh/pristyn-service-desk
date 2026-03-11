'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  TicketPriority,
  TicketShort,
  TicketStatus,
} from '@/types/ticket-types';
import { ArrowRight, Inbox } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type LatestTicketsTableProps = {
  tickets: TicketShort[];
  total: number;
  isLoading?: boolean;
  errorMessage?: string;
};

const statusLabelMap: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const statusClassMap: Record<TicketStatus, string> = {
  OPEN: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  RESOLVED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  CLOSED: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
};

const priorityClassMap: Record<TicketPriority, string> = {
  HIGH: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  MEDIUM: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  LOW: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
};

const formatTicketDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const ticketHref = (ticketId: string): string =>
  `/dashboard/moderator/tickets/${ticketId}`;

const LatestTicketsTable = ({
  tickets,
  total,
  isLoading = false,
  errorMessage,
}: LatestTicketsTableProps) => {
  const router = useRouter();

  const authUser = useAuthStore((state) => state.authUser);

  const latestTickets = [...tickets]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
    .slice(0, 6);

  const visibleTotal = tickets.length;
  const hasError = Boolean(errorMessage);
  const isPartial = total > visibleTotal;
  const hasNoData = !isLoading && !hasError && latestTickets.length === 0;

  return (
    <Card className='rounded-2xl border-border/70 shadow-sm'>
      <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-1'>
          <CardTitle>Latest tickets</CardTitle>
          <CardDescription>
            {hasError
              ? (errorMessage ?? 'Unable to load latest tickets')
              : isLoading
                ? 'Loading recent ticket activity'
                : isPartial
                  ? `Newest ${latestTickets.length} from ${visibleTotal} of ${total} tickets`
                  : `Most recent ${latestTickets.length} tickets`}
          </CardDescription>
        </div>
        <Link
          href='/dashboard/moderator/tickets'
          className='inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline'
        >
          View all tickets
          <ArrowRight className='h-4 w-4' />
        </Link>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className='grid grid-cols-[1.2fr_1.4fr_1fr_0.9fr_0.9fr] gap-3 rounded-xl border border-border/60 p-3'
              >
                <Skeleton className='h-4 w-24 rounded-md' />
                <Skeleton className='h-4 w-full rounded-md' />
                <Skeleton className='h-4 w-20 rounded-md' />
                <Skeleton className='h-4 w-16 rounded-md' />
                <Skeleton className='h-4 w-20 rounded-md' />
              </div>
            ))}
          </div>
        ) : hasNoData ? (
          <EmptyState
            icon={Inbox}
            title='No tickets yet'
            description='Recent ticket activity will appear here once tickets are created.'
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className='cursor-pointer'
                  onClick={() => router.push(ticketHref(ticket.id))}
                >
                  <TableCell className='font-medium text-foreground'>
                    <div className='flex flex-col'>
                      <span>{ticket.ticketNumber}</span>
                      <span className='truncate text-xs text-muted-foreground'>
                        {ticket.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    {ticket.customer.name}
                  </TableCell>
                  <TableCell>{ticket.category.name || 'Unassigned'}</TableCell>
                  <TableCell>
                    <Badge
                      variant='secondary'
                      className={cn('border-0', statusClassMap[ticket.status])}
                    >
                      {statusLabelMap[ticket.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='secondary'
                      className={cn(
                        'border-0 capitalize',
                        priorityClassMap[ticket.priority]
                      )}
                    >
                      {ticket.priority.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.assignedTo?.id === authUser?.id
                      ? 'You'
                      : (ticket.assignedTo?.name ?? 'Unassigned')}
                  </TableCell>
                  <TableCell className='hidden lg:table-cell text-muted-foreground'>
                    {formatTicketDate(ticket.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestTicketsTable;
