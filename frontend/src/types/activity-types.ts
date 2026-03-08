import { UserRole } from './user-types';

export type ActivityEntityType = 'TICKET' | 'USER' | 'SYSTEM';

export type ActivityLogAction =
  | 'TICKET_CREATED'
  | 'TICKET_UPDATED'
  | 'TICKET_ASSIGNED'
  | 'TICKET_STATUS_CHANGED'
  | 'TICKET_PRIORITY_CHANGED'
  | 'TICKET_DELETED'
  | 'USER_CREATED'
  | 'USER_ASSIGNED_TO_SUPERVISOR';

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
  generatedAt: string;
  activities: ActivityLogItem[];
}
