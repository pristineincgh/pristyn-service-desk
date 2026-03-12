import ModeratorUserDetails from '@/components/dashboard/moderator/users/ModeratorUserDetails';

const ModeratorUserDetailsPage = async ({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) => {
  const { user_id } = await params;

  return <ModeratorUserDetails userId={user_id} />;
};

export default ModeratorUserDetailsPage;
