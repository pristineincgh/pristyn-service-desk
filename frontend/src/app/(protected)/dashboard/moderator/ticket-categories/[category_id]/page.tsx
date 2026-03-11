import ModeratorTicketCategoryDetails from '@/components/dashboard/moderator/ticket-categories/ModeratorTicketCategoryDetails';

const ModeratorTicketCategoryDetailsPage = async ({
  params,
}: {
  params: Promise<{ category_id: string }>;
}) => {
  const { category_id } = await params;

  return <ModeratorTicketCategoryDetails categoryId={category_id} />;
};

export default ModeratorTicketCategoryDetailsPage;
