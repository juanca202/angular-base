import { inject, Injectable } from '@angular/core';
import { forkJoin, firstValueFrom, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { getApiUrl, getMutations, getResource, SignalGet } from '@/core/utils/async-repository';
import { MockHttpClient } from '@/core/utils/mock-http-client';
import relationshipsMock from '@/test/mocks/repositories/contact-relationships.json';

import type { Contact } from '../models/contact';
import type {
  ContactRelationship,
  ContactRelationshipType,
  CreateContactRelationship,
  UpdateContactRelationship
} from '../models/contact-relationship';
import type { ContactRelationshipView } from '../models/ui';
import type { ContactRelationshipRepository } from './contact-relationship-repository.contract';

@Injectable({
  providedIn: 'root'
})
export class ContactRelationshipsRepository implements ContactRelationshipRepository {
  private readonly httpClient = inject(MockHttpClient);

  private readonly baseUrl = getApiUrl('contact-relationships');
  private readonly contactsUrl = getApiUrl('contacts');

  private readonly relationshipsByContact = getResource<string, ContactRelationshipView[]>(
    (contactId: string) => {
      return forkJoin({
        relationships: this.httpClient.get<ContactRelationship[]>(this.baseUrl),
        contacts: this.httpClient.get<Contact[]>(this.contactsUrl)
      }).pipe(
        map(({ relationships, contacts }) => {
          const contactById = new Map((contacts ?? []).map((c) => [c.id, c] as const));
          return (relationships ?? [])
            .filter((r) => r.contactId === contactId)
            .map((r) => {
              const related = contactById.get(r.relatedContactId);
              const relatedName = related
                ? `${related.firstName} ${related.lastName}`
                : $localize`Unknown`;
              return {
                id: r.id,
                relatedContactId: r.relatedContactId,
                relatedContactName: relatedName,
                type: r.type
              } satisfies ContactRelationshipView;
            });
        })
      );
    }
  );

  constructor() {
    this.httpClient.loadCollection('contact-relationships', relationshipsMock);
  }

  public mutations() {
    return getMutations({
      create: (payload: CreateContactRelationship) =>
        this.httpClient.get<ContactRelationship[]>(this.baseUrl).pipe(
          switchMap((existing) => {
            if (!payload.type) {
              return throwError(() => ({
                error: { messages: [$localize`Relationship type is required.`] }
              }));
            }
            if (payload.contactId === payload.relatedContactId) {
              return throwError(() => ({
                error: { messages: [$localize`A contact cannot be related to itself.`] }
              }));
            }
            const duplicated = (existing ?? []).some(
              (r) =>
                r.contactId === payload.contactId && r.relatedContactId === payload.relatedContactId
            );
            if (duplicated) {
              return throwError(() => ({
                error: { messages: [$localize`This relationship already exists.`] }
              }));
            }
            return this.httpClient
              .post<ContactRelationship>(this.baseUrl, payload)
              .pipe(tap(() => this.relationshipsByContact.refresh()));
          })
        ),
      update: (args: { id: string; type: ContactRelationshipType }) => {
        if (!args.type) {
          return throwError(() => ({
            error: { messages: [$localize`Relationship type is required.`] }
          }));
        }
        return this.httpClient
          .put<ContactRelationship>(`${this.baseUrl}/${args.id}`, { type: args.type })
          .pipe(tap(() => this.relationshipsByContact.refresh()));
      },
      delete: (id: string) =>
        this.httpClient
          .delete<void>(`${this.baseUrl}/${id}`)
          .pipe(tap(() => this.relationshipsByContact.refresh()))
    });
  }

  public findByContact(): SignalGet<string, ContactRelationshipView[]> {
    return this.relationshipsByContact;
  }

  // ---------------------------------------------------------------------------
  // Contract methods (Promise-based)
  // ---------------------------------------------------------------------------

  public async getByContact(contactId: string): Promise<ContactRelationship[]> {
    const all =
      (await firstValueFrom(this.httpClient.get<ContactRelationship[]>(this.baseUrl))) ?? [];
    return all.filter((r) => r.contactId === contactId);
  }

  public async create(payload: CreateContactRelationship): Promise<ContactRelationship> {
    const created = await firstValueFrom(
      this.httpClient.get<ContactRelationship[]>(this.baseUrl).pipe(
        switchMap((existing) => {
          if (!payload.type) {
            return throwError(() => ({
              error: { messages: [$localize`Relationship type is required.`] }
            }));
          }
          if (payload.contactId === payload.relatedContactId) {
            return throwError(() => ({
              error: { messages: [$localize`A contact cannot be related to itself.`] }
            }));
          }
          const duplicated = (existing ?? []).some(
            (r) =>
              r.contactId === payload.contactId && r.relatedContactId === payload.relatedContactId
          );
          if (duplicated) {
            return throwError(() => ({
              error: { messages: [$localize`This relationship already exists.`] }
            }));
          }
          return this.httpClient.post<ContactRelationship>(this.baseUrl, payload);
        })
      )
    );
    if (!created) throw new Error($localize`Unexpected error`);
    return created;
  }

  public async update(
    id: string,
    payload: UpdateContactRelationship
  ): Promise<ContactRelationship> {
    if (!payload.type) {
      throw new Error($localize`Relationship type is required.`);
    }
    const updated = await firstValueFrom(
      this.httpClient.put<ContactRelationship>(`${this.baseUrl}/${id}`, { type: payload.type })
    );
    if (!updated) throw new Error($localize`Unexpected error`);
    return updated;
  }

  public async delete(id: string): Promise<void> {
    await firstValueFrom(this.httpClient.delete<void>(`${this.baseUrl}/${id}`));
  }
}
