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
import { Activity } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

const chartConfig = {
  resolved: {
    label: 'Resolved',
    color: '#cf3fff',
  },
  all: {
    label: 'All',
    color: '#2f80ed',
  },
} satisfies ChartConfig;

type ResolvedVsAllLineChartProps = {
  tickets: TicketShort[];
  total: number;
  isLoading?: boolean;
  errorMessage?: string;
};

const DAYS = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const ResolvedVsAllLineChart = ({
  tickets,
  total,
  isLoading = false,
  errorMessage,
}: ResolvedVsAllLineChartProps) => {
  const today = startOfDay(new Date());
  const days = Array.from({ length: DAYS }, (_, index) => {
    const date = new Date(today.getTime() - (DAYS - index - 1) * DAY_MS);
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      resolved: 0,
      all: 0,
    };
  });

  const daysByKey = new Map(days.map((day) => [day.key, day]));

  tickets.forEach((ticket) => {
    const createdKey = startOfDay(new Date(ticket.createdAt))
      .toISOString()
      .slice(0, 10);
    const createdDay = daysByKey.get(createdKey);

    if (createdDay) {
      createdDay.all += 1;
    }

    const isResolvedTicket =
      ticket.status === TicketStatus.RESOLVED ||
      ticket.status === TicketStatus.CLOSED;

    if (!isResolvedTicket) {
      return;
    }

    const resolvedKey = startOfDay(new Date(ticket.updatedAt))
      .toISOString()
      .slice(0, 10);
    const resolvedDay = daysByKey.get(resolvedKey);

    if (resolvedDay) {
      resolvedDay.resolved += 1;
    }
  });

  const visibleTotal = tickets.length;
  const hasError = Boolean(errorMessage);
  const isPartial = total > visibleTotal;
  const hasNoData =
    !isLoading &&
    !hasError &&
    days.every((day) => day.all === 0 && day.resolved === 0);

  return (
    <Card className='h-full rounded-2xl border-border/70 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle>Resolved/All</CardTitle>
        <CardDescription>
          {hasError
            ? (errorMessage ?? 'Unable to load ticket trend chart')
            : isLoading
              ? 'Loading recent ticket trend'
              : isPartial
                ? `Recent trend from ${visibleTotal} of ${total} tickets`
                : 'Last 8 days of created versus resolved tickets'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-64 w-full rounded-xl' />
            <div className='flex gap-4'>
              <Skeleton className='h-4 w-20 rounded-md' />
              <Skeleton className='h-4 w-20 rounded-md' />
            </div>
          </div>
        ) : hasNoData ? (
          <EmptyState
            icon={Activity}
            title='No trend data yet'
            description='Recent ticket activity will appear here once tickets are created and resolved.'
          />
        ) : (
          <ChartContainer config={chartConfig} className='h-80 w-full'>
            <LineChart
              data={days}
              margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='label'
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelKey='label'
                    indicator='line'
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
              <Line
                type='monotone'
                dataKey='resolved'
                stroke='var(--color-resolved)'
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type='monotone'
                dataKey='all'
                stroke='var(--color-all)'
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <ChartLegend
                content={<ChartLegendContent />}
                verticalAlign='top'
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ResolvedVsAllLineChart;
