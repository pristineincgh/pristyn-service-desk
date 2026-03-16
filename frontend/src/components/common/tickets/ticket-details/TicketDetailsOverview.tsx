import { formatUserDisplayName } from '@/lib/self-reference';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TicketDetail } from '@/types/ticket-types';
import { formatTimestamp } from './ticket-details.constants';
import { DetailRow } from './ticket-details-primitives';

interface TicketDetailsOverviewProps {
  ticket: TicketDetail;
  authUserId?: string;
}

const TicketDetailsOverview = ({
  ticket,
  authUserId,
}: TicketDetailsOverviewProps) => {
  return (
    <Card className='gap-0 overflow-hidden py-0'>
      <CardHeader className='border-b py-6'>
        <CardTitle>Ticket Summary</CardTitle>
        <CardDescription>
          Core ticket context, ownership, and timing details.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6 py-6'>
        <div className='space-y-4 rounded-xl border bg-muted/15 p-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.18em] text-muted-foreground'>
              Title
            </p>
            <p className='mt-2 text-lg font-semibold text-foreground'>
              {ticket.title}
            </p>
          </div>
          <div>
            <p className='text-xs uppercase tracking-[0.18em] text-muted-foreground'>
              Description
            </p>
            <p className='mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90'>
              {ticket.description}
            </p>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <DetailRow label='Ticket ID' value={ticket.ticketNumber} />
          <DetailRow label='Category' value={ticket.category.name} />
          <DetailRow label='Customer' value={ticket.customer.name} />
          <DetailRow
            label='Assigned To'
            value={
              ticket.assignedTo
                ? formatUserDisplayName(
                    ticket.assignedTo.name,
                    ticket.assignedTo.id,
                    authUserId
                  )
                : 'Unassigned'
            }
          />
          <DetailRow
            label='Created By'
            value={formatUserDisplayName(
              ticket.createdBy.name,
              ticket.createdBy.id,
              authUserId
            )}
          />
          <DetailRow
            label='Last Updated By'
            value={
              ticket.updatedBy
                ? formatUserDisplayName(
                    ticket.updatedBy.name,
                    ticket.updatedBy.id,
                    authUserId
                  )
                : 'Not recorded'
            }
          />
          <DetailRow
            label='Created At'
            value={formatTimestamp(ticket.createdAt)}
          />
          <DetailRow
            label='Updated At'
            value={formatTimestamp(ticket.updatedAt)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketDetailsOverview;
