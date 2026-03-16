import { UserRole } from "./user-types";

export type ActivityEntityType =
  | "TICKET"
  | "USER"
  | "CUSTOMER"
  | "TICKET_CATEGORY"
  | "SYSTEM";

export type ActivityLogAction =
  | "TICKET_CREATED"
  | "TICKET_UPDATED"
  | "TICKET_ASSIGNED"
  | "TICKET_STATUS_CHANGED"
  | "TICKET_PRIORITY_CHANGED"
  | "TICKET_DELETED"
  | "USER_CREATED"
  | "USER_VERIFICATION_EMAIL_SENT"
  | "USER_EMAIL_VERIFIED"
  | "USER_ASSIGNED_TO_SUPERVISOR"
  | "USER_STATUS_CHANGED"
  | "USER_PASSWORD_RESET"
  | "USER_PASSWORD_RESET_REQUESTED"
  | "USER_PASSWORD_RESET_COMPLETED"
  | "USER_LOGGED_IN"
  | "USER_LOGGED_OUT"
  | "CUSTOMER_CREATED"
  | "CUSTOMER_UPDATED"
  | "CUSTOMER_DELETED"
  | "TICKET_CATEGORY_CREATED"
  | "TICKET_CATEGORY_UPDATED"
  | "TICKET_CATEGORY_DELETED";

export interface ActivityFilters {
  search?: string;
  entityType?: ActivityEntityType;
  action?: ActivityLogAction;
  actorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ActivityActor {
  id: string;
  name: string;
  role: UserRole;
}

export interface ActivityTicketRef {
  id: string;
  ticketNumber: string;
  title: string;
}

export interface ActivityUserRef {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ActivityLogItem {
  id: string;
  action: ActivityLogAction;
  entityType: ActivityEntityType;
  entityId: string;
  actorId: string | null;
  ticketId: string | null;
  userId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: ActivityActor | null;
  ticket: ActivityTicketRef | null;
  user: ActivityUserRef | null;
}

export interface ActivityListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  generatedAt: string;
  activities: ActivityLogItem[];
}
