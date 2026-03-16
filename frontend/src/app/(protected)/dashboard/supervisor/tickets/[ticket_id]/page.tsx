import TicketDetails from '@/components/common/tickets/ticket-details/TicketDetails';

interface SupervisorTicketDetailsPageProps {
  params: Promise<{
    ticket_id: string;
  }>;
}

const SupervisorTicketDetailsPage = async ({
  params,
}: SupervisorTicketDetailsPageProps) => {
  const { ticket_id } = await params;

  return (
    <TicketDetails
      ticketId={ticket_id}
      basePath='/dashboard/supervisor/tickets'
    />
  );
};

export default SupervisorTicketDetailsPage;
