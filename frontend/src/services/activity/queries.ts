import { useQuery } from "@tanstack/react-query";
import * as endpoints from "./endpoints";
import { ActivityFilters, ActivityListResponse } from "@/types/activity-types";

export const activityQueryKeys = {
  all: ["activity"] as const,
  list: (page: number, limit: number, filters: ActivityFilters) =>
    ["activity", "list", page, limit, filters] as const,
};

export const useActivities = (
  page = 1,
  limit = 20,
  filters: ActivityFilters = {},
) =>
  useQuery<ActivityListResponse>({
    queryKey: activityQueryKeys.list(page, limit, filters),
    queryFn: () => endpoints.getActivities(page, limit, filters),
  });
