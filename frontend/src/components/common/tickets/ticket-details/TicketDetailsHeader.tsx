import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquarePlus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getStatusBadge } from '@/lib/get-status-badge';
import { cn } from '@/lib/utils';
import type { TicketDetail } from '@/types/ticket-types';
import {
  getSlaLabel,
  getSlaTone,
  PRIORITY_BADGE_STYLES,
  PRIORITY_LABELS,
} from './ticket-details.constants';

interface TicketDetailsHeaderProps {
  ticket: TicketDetail;
  isFetching: boolean;
  isDeleting: boolean;
  onAddNote: () => void;
  onEditDetails: () => void;
  onDeleteTicket: () => void;
}

const TicketDetailsHeader = ({
  ticket,
  isFetching,
  isDeleting,
  onAddNote,
  onEditDetails,
  onDeleteTicket,
}: TicketDetailsHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/dashboard/moderator/tickets');
  };

  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
      <div className='space-y-3'>
        <Button variant='link' type='button' onClick={handleBack}>
          <ArrowLeft />
          Back
        </Button>

        <div className='space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline' className='rounded-md'>
              {ticket.ticketNumber}
            </Badge>
            {getStatusBadge(ticket.status)}
            <Badge
              variant='outline'
              className={cn(
                'rounded-md',
                PRIORITY_BADGE_STYLES[ticket.priority]
              )}
            >
              {PRIORITY_LABELS[ticket.priority]} Priority
            </Badge>
            <Badge
              variant='outline'
              className={cn('rounded-md', getSlaTone(ticket))}
            >
              {getSlaLabel(ticket)}
            </Badge>
            {isFetching ? (
              <Badge variant='outline' className='rounded-md'>
                Refreshing...
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className='flex flex-wrap gap-2'>
        <Button variant='outline' type='button' onClick={onEditDetails}>
          <Pencil />
          Edit details
        </Button>
        <Button variant='outline' type='button' onClick={onAddNote}>
          <MessageSquarePlus />
          Add note
        </Button>
        <Button
          variant='destructive'
          type='button'
          onClick={onDeleteTicket}
          disabled={isDeleting}
        >
          {isDeleting ? <Spinner /> : <Trash2 />}
          Delete ticket
        </Button>
      </div>
    </div>
  );
};

export default TicketDetailsHeader;
