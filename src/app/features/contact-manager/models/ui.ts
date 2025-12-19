import type { ContactRelationshipType } from './contact-relationship';

export interface ContactListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface ContactRelationshipView {
  id: string;
  relatedContactId: string;
  relatedContactName: string;
  type: ContactRelationshipType;
}
