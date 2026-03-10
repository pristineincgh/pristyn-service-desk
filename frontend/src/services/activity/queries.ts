import { useQuery } from '@tanstack/react-query';
import * as endpoints from './endpoints';
import { ActivityListResponse } from '@/types/activity-types';

export const activityQueryKeys = {
  recent: (limit: number) => ['activity', 'recent', limit] as const,
};

export const useRecentActivities = (limit = 20) =>
  useQuery<ActivityListResponse>({
    queryKey: activityQueryKeys.recent(limit),
    queryFn: () => endpoints.getRecentActivities(limit),
  });
