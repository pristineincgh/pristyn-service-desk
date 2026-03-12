'use client';

import { EmptyState } from '@/components/common/EmptyState';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketShort, TicketStatus } from '@/types/ticket-types';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Pie, PieChart } from 'recharts';

const chartConfig = {
  OPEN: {
    label: 'Open',
    color: '#f59e0b',
  },
  IN_PROGRESS: {
    label: 'In progress',
    color: '#3b82f6',
  },
  RESOLVED: {
    label: 'Resolved',
    color: '#10b981',
  },
  CLOSED: {
    label: 'Closed',
    color: '#64748b',
  },
} satisfies ChartConfig;

type TicketStatusPieChartProps = {
  tickets: TicketShort[];
  total: number;
  isLoading?: boolean;
  errorMessage?: string;
};

const TicketStatusPieChart = ({
  tickets,
  total,
  isLoading = false,
  errorMessage,
}: TicketStatusPieChartProps) => {
  const statusData = [
    {
      status: TicketStatus.OPEN,
      count: tickets.filter((ticket) => ticket.status === TicketStatus.OPEN)
        .length,
      fill: 'var(--color-OPEN)',
    },
    {
      status: TicketStatus.IN_PROGRESS,
      count: tickets.filter(
        (ticket) => ticket.status === TicketStatus.IN_PROGRESS
      ).length,
      fill: 'var(--color-IN_PROGRESS)',
    },
    {
      status: TicketStatus.RESOLVED,
      count: tickets.filter((ticket) => ticket.status === TicketStatus.RESOLVED)
        .length,
      fill: 'var(--color-RESOLVED)',
    },
    {
      status: TicketStatus.CLOSED,
      count: tickets.filter((ticket) => ticket.status === TicketStatus.CLOSED)
        .length,
      fill: 'var(--color-CLOSED)',
    },
  ].filter((item) => item.count > 0);

  const visibleTotal = tickets.length;
  const hasError = Boolean(errorMessage);
  const isPartial = total > visibleTotal;
  const hasNoData = !isLoading && !hasError && statusData.length === 0;

  return (
    <Card className='h-full rounded-2xl border-border/70 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle>Ticket status</CardTitle>
        <CardDescription>
          {hasError
            ? (errorMessage ?? 'Unable to load ticket status chart')
            : isLoading
              ? 'Loading status distribution'
              : isPartial
                ? `Status split for ${visibleTotal} of ${total} tickets`
                : `Status split across ${total} tickets`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className='flex h-80 flex-col items-center justify-center gap-6'>
            <Skeleton className='h-44 w-44 rounded-full' />
            <div className='flex flex-wrap items-center justify-center gap-4'>
              <Skeleton className='h-4 w-20 rounded-md' />
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-4 w-20 rounded-md' />
              <Skeleton className='h-4 w-18 rounded-md' />
            </div>
          </div>
        ) : hasNoData ? (
          <EmptyState
            icon={PieChartIcon}
            title='No ticket data yet'
            description='Create or load tickets to see the status distribution here.'
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square h-50 max-h-50'
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey='status'
                    formatter={(value, name) => (
                      <div className='flex w-full items-center justify-between gap-4'>
                        <span>
                          {chartConfig[name as keyof typeof chartConfig]
                            ?.label ?? name}
                        </span>
                        <span className='font-mono tabular-nums'>
                          {Number(value).toLocaleString()}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={statusData}
                dataKey='count'
                nameKey='status'
                innerRadius={58}
                outerRadius={85}
                strokeWidth={4}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey='status' />}
                verticalAlign='bottom'
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
export default TicketStatusPieChart;
