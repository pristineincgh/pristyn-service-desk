import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type KpiTrendTone = 'positive' | 'negative' | 'neutral';
type KpiTheme = 'slate' | 'blue' | 'emerald' | 'amber' | 'rose';

type KpiTrend = {
  label: string;
  tone?: KpiTrendTone;
};

type KPICardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: KpiTrend;
  theme?: KpiTheme;
  detailsLabel?: string;
  detailsHref?: string;
  loading?: boolean;
  className?: string;
  valueClassName?: string;
};

const trendToneClassMap: Record<KpiTrendTone, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted-foreground',
};

const themeClassMap: Record<
  KpiTheme,
  { card: string; icon: string; value: string }
> = {
  slate: {
    card: 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-card',
    icon: 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-[0_8px_18px_-10px_rgba(100,116,139,0.9)]',
    value: 'text-slate-900 dark:text-slate-100',
  },
  blue: {
    card: 'border-sky-200/80 bg-white dark:border-sky-900 dark:bg-card',
    icon: 'bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-[0_8px_18px_-10px_rgba(59,130,246,0.9)]',
    value: 'text-slate-900 dark:text-slate-100',
  },
  emerald: {
    card: 'border-emerald-200/80 bg-white dark:border-emerald-900 dark:bg-card',
    icon: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_8px_18px_-10px_rgba(16,185,129,0.9)]',
    value: 'text-slate-900 dark:text-slate-100',
  },
  amber: {
    card: 'border-amber-200/80 bg-white dark:border-amber-900 dark:bg-card',
    icon: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_8px_18px_-10px_rgba(245,158,11,0.9)]',
    value: 'text-slate-900 dark:text-slate-100',
  },
  rose: {
    card: 'border-rose-200/80 bg-white dark:border-rose-900 dark:bg-card',
    icon: 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-[0_8px_18px_-10px_rgba(244,63,94,0.9)]',
    value: 'text-slate-900 dark:text-slate-100',
  },
};

const KPICard = ({
  title,
  value,
  description,
  icon,
  trend,
  theme = 'slate',
  detailsLabel = 'View details',
  detailsHref,
  loading = false,
  className,
  valueClassName,
}: KPICardProps) => {
  const themeClasses = themeClassMap[theme];

  return (
    <Card
      className={cn(
        'gap-0 overflow-hidden rounded-2xl py-0 shadow-sm',
        themeClasses.card,
        className
      )}
    >
      <CardHeader className='flex flex-row items-center gap-4 px-5 py-4'>
        {icon ? (
          <div
            className={cn(
              'grid h-12 w-12 shrink-0 place-content-center rounded-xl',
              themeClasses.icon
            )}
          >
            {icon}
          </div>
        ) : null}

        <div className='min-w-0'>
          {loading ? (
            <>
              <Skeleton className='h-8 w-20 rounded-lg' />
              <Skeleton className='mt-2 h-4 w-28 rounded-md' />
            </>
          ) : (
            <>
              <p
                className={cn(
                  'truncate text-2xl font-bold leading-none tracking-tight',
                  themeClasses.value,
                  valueClassName
                )}
              >
                {value}
              </p>

              <CardTitle className='mt-1 truncate text-sm font-medium text-muted-foreground'>
                {title}
              </CardTitle>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className='px-0 pb-0 pt-0'>
        <div className='mx-5 border-t border-dashed border-border/80' />
        {loading && trend ? (
          <Skeleton className='mx-5 mt-2 h-4 w-40 rounded-md' />
        ) : trend ? (
          <p
            className={cn(
              'px-5 pb-1 pt-2 text-xs font-medium',
              trendToneClassMap[trend.tone ?? 'neutral']
            )}
          >
            {trend.label}
          </p>
        ) : null}

        {loading && detailsHref ? (
          <div className='flex items-center justify-between px-5 py-3'>
            <Skeleton className='h-5 w-24 rounded-md' />
            <Skeleton className='h-4 w-4 rounded-sm' />
          </div>
        ) : detailsHref ? (
          <Link
            href={detailsHref}
            className='group flex items-center justify-between px-5 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted/40'
          >
            <span>{detailsLabel}</span>
            <ArrowRight className='h-4 w-4 transition-transform duration-200 group-hover:translate-x-1' />
          </Link>
        ) : null}

        {loading && description ? (
          <div className='px-5 pb-3 pt-0'>
            <Skeleton className='h-3 w-full rounded-md' />
          </div>
        ) : description ? (
          <CardDescription className='px-5 pb-3 pt-0 text-xs'>
            {description}
          </CardDescription>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default KPICard;
