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
import { TicketPriority, TicketShort } from '@/types/ticket-types';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Cell, Label, Pie, PieChart } from 'recharts';

const chartConfig = {
  HIGH: {
    label: 'High',
    color: '#ff6b5f',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#f5a623',
  },
  LOW: {
    label: 'Low',
    color: '#2f80ed',
  },
} satisfies ChartConfig;

type TicketPriorityPieChartProps = {
  tickets: TicketShort[];
  total: number;
  isLoading?: boolean;
  errorMessage?: string;
};

const TicketPriorityPieChart = ({
  tickets,
  total,
  isLoading = false,
  errorMessage,
}: TicketPriorityPieChartProps) => {
  const priorityData = [
    {
      priority: TicketPriority.HIGH,
      count: tickets.filter((ticket) => ticket.priority === TicketPriority.HIGH)
        .length,
    },
    {
      priority: TicketPriority.MEDIUM,
      count: tickets.filter(
        (ticket) => ticket.priority === TicketPriority.MEDIUM
      ).length,
    },
    {
      priority: TicketPriority.LOW,
      count: tickets.filter((ticket) => ticket.priority === TicketPriority.LOW)
        .length,
    },
  ].filter((item) => item.count > 0);

  const visibleTotal = tickets.length;
  const hasError = Boolean(errorMessage);
  const isPartial = total > visibleTotal;
  const hasNoData = !isLoading && !hasError && priorityData.length === 0;

  return (
    <Card className='h-full rounded-2xl border-border/70 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle>Ticket priority</CardTitle>
        <CardDescription>
          {hasError
            ? (errorMessage ?? 'Unable to load priority chart')
            : isLoading
              ? 'Loading priority distribution'
              : isPartial
                ? `Priority split for ${visibleTotal} of ${total} tickets`
                : `Priority split across ${total} tickets`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className='flex h-80 flex-col items-center justify-center gap-6'>
            <Skeleton className='h-44 w-44 rounded-full' />
            <div className='flex flex-wrap items-center justify-center gap-4'>
              <Skeleton className='h-4 w-16 rounded-md' />
              <Skeleton className='h-4 w-20 rounded-md' />
              <Skeleton className='h-4 w-16 rounded-md' />
            </div>
          </div>
        ) : hasNoData ? (
          <EmptyState
            icon={PieChartIcon}
            title='No priority data yet'
            description='Create or load tickets to see how work is split by urgency.'
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square h-80 max-h-80'
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey='priority'
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
                data={priorityData}
                dataKey='count'
                nameKey='priority'
                innerRadius={70}
                outerRadius={102}
                strokeWidth={0}
              >
                {priorityData.map((item) => (
                  <Cell
                    key={item.priority}
                    fill={`var(--color-${item.priority})`}
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) {
                      return null;
                    }

                    const cx = viewBox.cx ?? 0;
                    const cy = viewBox.cy ?? 0;

                    return (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={cx}
                          y={cy - 8}
                          className='fill-muted-foreground text-[12px]'
                        >
                          Total
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 18}
                          className='fill-foreground text-[26px] font-semibold'
                        >
                          {visibleTotal}
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey='priority' />}
                verticalAlign='bottom'
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketPriorityPieChart;
