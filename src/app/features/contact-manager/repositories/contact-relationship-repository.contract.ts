import type {
  ContactRelationship,
  CreateContactRelationship,
  UpdateContactRelationship
} from '../models/contact-relationship';

export interface ContactRelationshipRepository {
  getByContact(contactId: string): Promise<ContactRelationship[]>;
  create(payload: CreateContactRelationship): Promise<ContactRelationship>;
  update(id: string, payload: UpdateContactRelationship): Promise<ContactRelationship>;
  delete(id: string): Promise<void>;
}
