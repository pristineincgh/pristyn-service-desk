export interface TicketCategory {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  ticketCount?: number;
}

export interface TicketCategoryTicketSummary {
  id: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string;
  } | null;
}

export interface TicketCategoryDetail extends TicketCategory {
  tickets: TicketCategoryTicketSummary[];
}

export interface CreateTicketCategoryPayload {
  name: string;
}

export interface UpdateTicketCategoryPayload {
  name?: string;
}

export interface UpdateTicketCategoryResponse {
  message: string;
  data: TicketCategory;
}

export interface DeleteTicketCategoryResponse {
  message: string;
}

export interface TicketCategoryRef {
  id: string;
  name: string;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export type TicketSlaState = 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'COMPLETED';

export interface TicketSlaSnapshot {
  targetHours: number;
  atRiskWindowHours: number;
  deadlineAt: string;
  calculatedAt: string;
  remainingMs: number;
  remainingHours: number;
  breached: boolean;
  atRisk: boolean;
  state: TicketSlaState;
}

export interface TicketShort {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  customerId: string;
  category: TicketCategoryRef;
  status: TicketStatus;
  assignedTo: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
  };
  updatedBy: {
    id: string;
    name: string;
  } | null;
  customer: {
    id: string;
    name: string;
  };
  priority: TicketPriority;
  sla: TicketSlaSnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetail extends TicketShort {
  notes: TicketNote[];
}

export interface CreateNewTicketResponse {
  message: string;
  ticket: TicketShort;
}

export interface TicketListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  tickets: TicketShort[];
}

export interface TicketListFilters {
  categoryId?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  categoryId: string;
  customerId: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string;
}

export type UpdateTicketPayload = Partial<CreateTicketPayload>;

export interface UpdateTicketResponse {
  message: string;
  ticket: TicketShort;
}

export interface DeleteTicketResponse {
  message: string;
}

export interface BulkReassignTicketsPayload {
  ticketIds: string[];
  assignedToId: string;
}

export interface BulkUpdateTicketStatusPayload {
  ticketIds: string[];
  status: TicketStatus;
}

export interface BulkDeleteTicketsPayload {
  ticketIds: string[];
}

export interface BulkTicketsMutationResponse {
  message: string;
  ticketIds: string[];
  updatedCount?: number;
  changedCount?: number;
  deletedCount?: number;
}

export interface TicketNoteAuthor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TicketNoteCustomerAuthor {
  id: string;
  name: string;
  email: string | null;
  phone: string;
}

export interface TicketNote {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  ticketId: string;
  createdById: string | null;
  createdByCustomerId: string | null;
  createdBy: TicketNoteAuthor | null;
  createdByCustomer: TicketNoteCustomerAuthor | null;
}

export interface TicketNotesResponse {
  ticketId: string;
  notes: TicketNote[];
}

export interface CreateTicketNotePayload {
  content: string;
  isInternal?: boolean;
}

export interface UpdateTicketNotePayload {
  content?: string;
  isInternal?: boolean;
}

export interface TicketNoteMutationResponse {
  message: string;
  note: TicketNote;
}

export interface DeleteTicketNoteResponse {
  message: string;
}
