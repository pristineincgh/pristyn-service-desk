import TicketDetails from '@/components/common/tickets/ticket-details/TicketDetails';

const TicketDetailsPage = async ({
  params,
}: {
  params: Promise<{ ticket_id: string }>;
}) => {
  const { ticket_id } = await params;
  return <TicketDetails ticketId={ticket_id} />;
};
export default TicketDetailsPage;
