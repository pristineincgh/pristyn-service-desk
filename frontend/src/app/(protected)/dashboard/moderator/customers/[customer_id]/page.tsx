import ModeratorCustomerDetails from '@/components/dashboard/moderator/customers/ModeratorCustomerDetails';

const ModeratorCustomerDetailsPage = async ({
  params,
}: {
  params: Promise<{ customer_id: string }>;
}) => {
  const { customer_id } = await params;

  return <ModeratorCustomerDetails customerId={customer_id} />;
};

export default ModeratorCustomerDetailsPage;
