import type { Contact, CreateContact, UpdateContact } from '../models/contact';

export interface ContactRepository {
  getAll(): Promise<Contact[]>;
  getById(id: string): Promise<Contact>;
  create(payload: CreateContact): Promise<Contact>;
  update(id: string, payload: UpdateContact): Promise<Contact>;
  delete(id: string): Promise<void>;
}
