import { inject, Injectable } from '@angular/core';
import { firstValueFrom, from, throwError } from 'rxjs';
import { switchMap, tap, toArray } from 'rxjs/operators';

import { getApiUrl, getMutations, getResource, SignalGet } from '@/core/utils/async-repository';
import { MockHttpClient } from '@/core/utils/mock-http-client';
import contactsMock from '@/test/mocks/repositories/contacts.json';

import type { Contact, CreateContact, UpdateContact } from '../models/contact';
import type { ContactRelationship } from '../models/contact-relationship';
import type { ContactRepository } from './contact-repository.contract';

@Injectable({
  providedIn: 'root'
})
export class ContactsRepository implements ContactRepository {
  private readonly httpClient = inject(MockHttpClient);

  private readonly baseUrl = getApiUrl('contacts');
  private readonly relationshipsUrl = getApiUrl('contact-relationships');

  private readonly contact = getResource<string, Contact>((id: string) => {
    return this.httpClient.get<Contact>(`${this.baseUrl}/${id}`);
  });

  private readonly contacts = getResource<void, Contact[]>(() => {
    return this.httpClient.get<Contact[]>(`${this.baseUrl}`);
  });

  constructor() {
    this.httpClient.loadCollection('contacts', contactsMock);
  }

  public mutations() {
    return getMutations({
      create: (payload: CreateContact) =>
        this.httpClient
          .post<Contact>(this.baseUrl, payload)
          .pipe(tap(() => this.contacts.refresh())),
      update: (payload: Contact & { id: string }) =>
        this.httpClient
          .put<Contact>(`${this.baseUrl}/${payload.id}`, payload)
          .pipe(tap(() => this.contacts.refresh())),
      delete: (id: string) =>
        this.httpClient.get<ContactRelationship[]>(this.relationshipsUrl).pipe(
          switchMap((relationships) => {
            const incoming = relationships?.some((r) => r.relatedContactId === id);
            if (incoming) {
              return throwError(() => ({
                error: {
                  messages: [
                    $localize`Cannot delete this contact because it is referenced by another contact.`
                  ]
                }
              }));
            }

            const outgoing = (relationships ?? []).filter((r) => r.contactId === id);
            return from(outgoing).pipe(
              switchMap((rel) =>
                this.httpClient.delete<void>(`${this.relationshipsUrl}/${rel.id}`)
              ),
              toArray(),
              switchMap(() => this.httpClient.delete<void>(`${this.baseUrl}/${id}`))
            );
          }),
          tap(() => this.contacts.refresh())
        )
    });
  }

  public find(): SignalGet<string, Contact> {
    return this.contact;
  }

  public findBy(): SignalGet<void, Contact[]> {
    return this.contacts;
  }

  // ---------------------------------------------------------------------------
  // Contract methods (Promise-based)
  // ---------------------------------------------------------------------------

  public async getAll(): Promise<Contact[]> {
    return (await firstValueFrom(this.httpClient.get<Contact[]>(this.baseUrl))) ?? [];
  }

  public async getById(id: string): Promise<Contact> {
    const contact = await firstValueFrom(this.httpClient.get<Contact>(`${this.baseUrl}/${id}`));
    if (!contact) {
      throw new Error($localize`Contact not found`);
    }
    return contact;
  }

  public async create(payload: CreateContact): Promise<Contact> {
    const created = await firstValueFrom(this.httpClient.post<Contact>(this.baseUrl, payload));
    if (!created) {
      throw new Error($localize`Unexpected error`);
    }
    return created;
  }

  public async update(id: string, payload: UpdateContact): Promise<Contact> {
    const updated = await firstValueFrom(
      this.httpClient.put<Contact>(`${this.baseUrl}/${id}`, payload)
    );
    if (!updated) {
      throw new Error($localize`Unexpected error`);
    }
    return updated;
  }

  public async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.httpClient.get<ContactRelationship[]>(this.relationshipsUrl).pipe(
        switchMap((relationships) => {
          const incoming = relationships?.some((r) => r.relatedContactId === id);
          if (incoming) {
            return throwError(() => ({
              error: {
                messages: [
                  $localize`Cannot delete this contact because it is referenced by another contact.`
                ]
              }
            }));
          }

          const outgoing = (relationships ?? []).filter((r) => r.contactId === id);
          return from(outgoing).pipe(
            switchMap((rel) => this.httpClient.delete<void>(`${this.relationshipsUrl}/${rel.id}`)),
            toArray(),
            switchMap(() => this.httpClient.delete<void>(`${this.baseUrl}/${id}`))
          );
        })
      )
    );
  }
}
