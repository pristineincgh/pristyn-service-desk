import type { ReactNode } from 'react';

export const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <div className='flex items-start justify-between gap-4 text-sm'>
    <span className='text-muted-foreground'>{label}</span>
    <span className='text-right font-bold'>{value}</span>
  </div>
);

export const MetricCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) => (
  <div className='rounded-xl border bg-muted/20 p-4'>
    <p className='text-xs uppercase tracking-[0.18em] text-muted-foreground'>
      {label}
    </p>
    <div className='mt-2 text-xl font-semibold'>{value}</div>
    {hint ? <p className='mt-1 text-sm text-muted-foreground'>{hint}</p> : null}
  </div>
);
