import { apiFetch } from "@/lib/api";
import { ActivityFilters, ActivityListResponse } from "@/types/activity-types";

const BASE_URL = "/api/activity";

export const getActivities = async (
  page = 1,
  limit = 20,
  filters: ActivityFilters = {},
): Promise<ActivityListResponse> => {
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filters.search) {
    queryParams.set("search", filters.search);
  }

  if (filters.entityType) {
    queryParams.set("entityType", filters.entityType);
  }

  if (filters.action) {
    queryParams.set("action", filters.action);
  }

  if (filters.actorId) {
    queryParams.set("actorId", filters.actorId);
  }

  if (filters.dateFrom) {
    queryParams.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    queryParams.set("dateTo", filters.dateTo);
  }

  return apiFetch(`${BASE_URL}?${queryParams.toString()}`);
};
