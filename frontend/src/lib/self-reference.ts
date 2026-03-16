export const isCurrentUser = (
  userId: string | null | undefined,
  currentUserId: string | null | undefined
) => Boolean(userId && currentUserId && userId === currentUserId);

export const formatUserDisplayName = (
  name: string,
  userId: string | null | undefined,
  currentUserId: string | null | undefined
) => (isCurrentUser(userId, currentUserId) ? `You (${name})` : name);

export const formatUserObjectLabel = (
  name: string,
  userId: string | null | undefined,
  currentUserId: string | null | undefined
) => (isCurrentUser(userId, currentUserId) ? 'you' : name);

export const formatUserReflexiveLabel = (
  name: string,
  userId: string | null | undefined,
  currentUserId: string | null | undefined
) => (isCurrentUser(userId, currentUserId) ? 'yourself' : name);
