import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';
import {
  TicketStatus,
  type TicketDetail,
  type TicketNote,
  type TicketPriority,
} from '@/types/ticket-types';
import { UserRole } from '@/types/user-types';

export const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: TicketStatus.OPEN, label: 'Open' },
  { value: TicketStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TicketStatus.RESOLVED, label: 'Resolved' },
  { value: TicketStatus.CLOSED, label: 'Closed' },
];

export const PRIORITY_BADGE_STYLES: Record<TicketPriority, string> = {
  HIGH: 'border-transparent bg-rose-100 text-rose-700 hover:bg-rose-100',
  MEDIUM: 'border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100',
  LOW: 'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-100',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const formatTimestamp = (value?: string) => {
  if (!value) {
    return 'Unknown';
  }

  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return 'Unknown';
  }

  return format(parsed, 'PPPP');
};

export const formatRelativeTimestamp = (value?: string) => {
  if (!value) {
    return 'Unknown';
  }

  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return 'Unknown';
  }

  return formatDistanceToNowStrict(parsed, { addSuffix: true });
};

export const getSlaTone = (ticket: TicketDetail) => {
  switch (ticket.sla.state) {
    case 'BREACHED':
      return 'border-transparent bg-rose-100 text-rose-700';
    case 'AT_RISK':
      return 'border-transparent bg-amber-100 text-amber-700';
    case 'ON_TRACK':
      return 'border-transparent bg-emerald-100 text-emerald-700';
    default:
      return 'border-transparent bg-slate-100 text-slate-700';
  }
};

export const getSlaLabel = (ticket: TicketDetail) => {
  switch (ticket.sla.state) {
    case 'BREACHED':
      return `Breached by ${Math.abs(ticket.sla.remainingHours).toFixed(1)}h`;
    case 'AT_RISK':
      return `${ticket.sla.remainingHours.toFixed(1)}h remaining`;
    case 'ON_TRACK':
      return `${ticket.sla.remainingHours.toFixed(1)}h remaining`;
    default:
      return 'Completed';
  }
};

export const canManageNote = (
  note: TicketNote,
  userId?: string,
  role?: UserRole
) => {
  if (!userId || !role) {
    return false;
  }

  return role === UserRole.MODERATOR || note.createdById === userId;
};
