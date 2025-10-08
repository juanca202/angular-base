export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export type CustomerRequest = Omit<Customer, 'id'> & { id?: string };
