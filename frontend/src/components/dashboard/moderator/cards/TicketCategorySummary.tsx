'use client';

import { EmptyState } from '@/components/common/EmptyState';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketShort, TicketStatus } from '@/types/ticket-types';
import { Layers3 } from 'lucide-react';

type TicketCategorySummaryProps = {
  tickets: TicketShort[];
  total: number;
  isLoading?: boolean;
  errorMessage?: string;
};

const TicketCategorySummary = ({
  tickets,
  total,
  isLoading = false,
  errorMessage,
}: TicketCategorySummaryProps) => {
  const categoryData = Array.from(
    tickets.reduce((map, ticket) => {
      const key = ticket.category.name || 'Unassigned';
      const current = map.get(key) ?? {
        category: key,
        total: 0,
        resolved: 0,
      };

      current.total += 1;
      if (
        ticket.status === TicketStatus.RESOLVED ||
        ticket.status === TicketStatus.CLOSED
      ) {
        current.resolved += 1;
      }

      map.set(key, current);
      return map;
    }, new Map<string, { category: string; total: number; resolved: number }>())
  )
    .map(([, value]) => value)
    .sort((left, right) => right.total - left.total)
    .slice(0, 5);

  const maxCount = Math.max(...categoryData.map((item) => item.total), 1);
  const visibleTotal = tickets.length;
  const hasError = Boolean(errorMessage);
  const isPartial = total > visibleTotal;
  const hasNoData = !isLoading && !hasError && categoryData.length === 0;

  return (
    <Card className='h-full rounded-2xl border-border/70 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle>Tickets per category</CardTitle>
        <CardDescription>
          {hasError
            ? (errorMessage ?? 'Unable to load category summary')
            : isLoading
              ? 'Loading category distribution'
              : isPartial
                ? `Top categories from ${visibleTotal} of ${total} tickets`
                : `Top categories across ${total} tickets`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className='space-y-5'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className='space-y-2'>
                <div className='flex items-center justify-between gap-3'>
                  <Skeleton className='h-4 w-28 rounded-md' />
                  <Skeleton className='h-4 w-32 rounded-md' />
                </div>
                <Skeleton className='h-2.5 w-full rounded-full' />
              </div>
            ))}
          </div>
        ) : hasNoData ? (
          <EmptyState
            icon={Layers3}
            title='No category data yet'
            description='Create or load tickets to see which categories dominate the queue.'
          />
        ) : (
          <div className='space-y-5'>
            {categoryData.map((item) => {
              const progress = (item.total / maxCount) * 100;
              const completion =
                item.total === 0 ? 0 : (item.resolved / item.total) * 100;

              return (
                <div key={item.category} className='space-y-2'>
                  <div className='flex items-center justify-between gap-3 text-sm'>
                    <span className='truncate font-medium text-foreground'>
                      {item.category}
                    </span>
                    <span className='shrink-0 text-xs text-muted-foreground'>
                      {item.total} tickets / {item.resolved} resolved
                    </span>
                  </div>
                  <div className='h-2.5 overflow-hidden rounded-full bg-muted'>
                    <div
                      className='h-full rounded-full bg-foreground/85'
                      style={{ width: `${Math.max(progress, 10)}%` }}
                    />
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {completion.toFixed(0)}% completion rate
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketCategorySummary;
