import { Badge } from '@/components/ui/badge';
import { TicketStatus } from '@/types/ticket-types';
import { cn } from './utils';

const normalizeStatus = (status: TicketStatus | string): string =>
  status.trim().toUpperCase().replace(/\s+/g, '_');

type BadgeStyle = {
  label: string;
  className: string;
};

const STATUS_BADGE_STYLES: Record<string, BadgeStyle> = {
  [TicketStatus.OPEN]: {
    label: 'Open',
    className: 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  [TicketStatus.IN_PROGRESS]: {
    label: 'In Progress',
    className:
      'border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  [TicketStatus.RESOLVED]: {
    label: 'Resolved',
    className:
      'border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  [TicketStatus.CLOSED]: {
    label: 'Closed',
    className:
      'border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
};

const toLabel = (normalizedStatus: string): string =>
  normalizedStatus
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const getStatusBadge = (status: TicketStatus | string) => {
  const normalizedStatus = normalizeStatus(status);
  const style = STATUS_BADGE_STYLES[normalizedStatus];

  return (
    <Badge
      variant='outline'
      className={cn(
        'rounded',
        style?.className ??
          'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-100'
      )}
    >
      {style?.label ?? toLabel(normalizedStatus)}
    </Badge>
  );
};
