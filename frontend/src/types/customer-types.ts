export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  createdAt: string;
  updatedAt: string;
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
