export type ContactRelationshipType =
  | 'FRIEND'
  | 'FAMILY'
  | 'COLLEAGUE'
  | 'MANAGER'
  | 'DIRECT_REPORT'
  | 'PARTNER'
  | 'CLIENT'
  | 'SUPPLIER';

export interface ContactRelationship {
  id: string;
  contactId: string;
  relatedContactId: string;
  type: ContactRelationshipType;
}

export type CreateContactRelationship = Omit<ContactRelationship, 'id'>;
export type UpdateContactRelationship = Pick<ContactRelationship, 'type'>;
