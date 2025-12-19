export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

export type CreateContact = Omit<Contact, 'id'>;
export type UpdateContact = Omit<Contact, 'id'>;
