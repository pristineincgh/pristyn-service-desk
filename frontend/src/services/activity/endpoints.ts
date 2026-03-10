import { apiFetch } from '@/lib/api';
import { ActivityListResponse } from '@/types/activity-types';

const BASE_URL = '/api/activity';

export const getRecentActivities = async (
  limit = 20
): Promise<ActivityListResponse> => {
  const query = new URLSearchParams({ limit: String(limit) }).toString();

  return apiFetch(`${BASE_URL}/recent?${query}`);
};
