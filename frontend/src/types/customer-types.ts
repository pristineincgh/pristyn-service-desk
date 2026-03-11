import { TicketPriority, TicketStatus } from './ticket-types';

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTicketSummary {
  id: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  ticketCategory: {
    id: string;
    name: string;
  } | null;
  assignedTo: {
    id: string;
    name: string;
  } | null;
}

export interface CustomerDetail extends Customer {
  tickets: CustomerTicketSummary[];
}

export interface CustomerListResponse {
  total: number;
  customers: Customer[];
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
}

export interface CreateCustomerResponse {
  message: string;
  customer: Customer;
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
  email?: string;
}

export interface UpdateCustomerResponse {
  message: string;
  customer: Customer;
}

export interface DeleteCustomerResponse {
  message: string;
}
