'use client';

import KPICard from '@/components/common/cards/KPICard';
import { Button } from '@/components/ui/button';
import { TicketShort, TicketStatus } from '@/types/ticket-types';
import {
  AlertTriangle,
  CheckCheck,
  Clock3,
  FolderOpen,
  Inbox,
  ListTodo,
  Plus,
} from 'lucide-react';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type TicketSummaryProps = {
  tickets: TicketShort[];
  total: number;
  isLoading?: boolean;
  errorMessage?: string;
  onOpenNewTicketModal?: (open: boolean) => void;
};

const TicketSummary = ({
  tickets,
  isLoading = false,
  onOpenNewTicketModal,
}: TicketSummaryProps) => {
  const referenceTimeMs = tickets.reduce((latest, ticket) => {
    const calculatedAtMs = new Date(ticket.sla.calculatedAt).getTime();

    if (Number.isNaN(calculatedAtMs)) {
      return latest;
    }

    return Math.max(latest, calculatedAtMs);
  }, 0);

  const newTicketsCount = tickets.filter(
    (ticket) =>
      referenceTimeMs - new Date(ticket.createdAt).getTime() <= ONE_DAY_MS
  ).length;
  const overdueTicketsCount = tickets.filter(
    (ticket) => ticket.sla.breached
  ).length;
  const openTicketsCount = tickets.filter(
    (ticket) => ticket.status === TicketStatus.OPEN
  ).length;
  const inProgressTicketsCount = tickets.filter(
    (ticket) => ticket.status === TicketStatus.IN_PROGRESS
  ).length;
  const resolvedTicketsCount = tickets.filter(
    (ticket) => ticket.status === TicketStatus.RESOLVED
  ).length;
  const closedTicketsCount = tickets.filter(
    (ticket) => ticket.status === TicketStatus.CLOSED
  ).length;

  const cards = [
    {
      title: 'New tickets',
      value: newTicketsCount,
      description: 'Created in the last 24 hours.',
      icon: <Inbox className='h-5 w-5' />,
      theme: 'blue' as const,
    },
    {
      title: 'Overdue tickets',
      value: overdueTicketsCount,
      description: 'Active tickets with breached SLA.',
      icon: <AlertTriangle className='h-5 w-5' />,
      theme: 'rose' as const,
    },
    {
      title: 'Open tickets',
      value: openTicketsCount,
      description: 'Tickets waiting to be actively worked.',
      icon: <FolderOpen className='h-5 w-5' />,
      theme: 'amber' as const,
    },
    {
      title: 'In progress',
      value: inProgressTicketsCount,
      description: 'Tickets currently being handled.',
      icon: <Clock3 className='h-5 w-5' />,
      theme: 'slate' as const,
    },
    {
      title: 'Resolved',
      value: resolvedTicketsCount,
      description: 'Tickets resolved and pending closure review.',
      icon: <ListTodo className='h-5 w-5' />,
      theme: 'emerald' as const,
    },
    {
      title: 'Closed',
      value: closedTicketsCount,
      description: 'Tickets fully completed and closed.',
      icon: <CheckCheck className='h-5 w-5' />,
      theme: 'emerald' as const,
    },
  ];

  return (
    <section className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-lg font-semibold tracking-tight text-foreground'>
            Ticket summary
          </h2>
          <p className='text-sm text-muted-foreground'>
            Operational snapshot across current ticket statuses and SLA health.
          </p>
        </div>

        {onOpenNewTicketModal ? (
          <Button type='button' onClick={() => onOpenNewTicketModal(true)}>
            <Plus />
            New Ticket
          </Button>
        ) : null}
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {cards.map((card) => (
          <KPICard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            theme={card.theme}
            loading={isLoading}
          />
        ))}
      </div>
    </section>
  );
};
export default TicketSummary;
