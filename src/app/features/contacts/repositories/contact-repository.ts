import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Contact, ContactRequest } from '@/features/contacts/models/contact';
import { getMutations, getResource, SignalGet } from '@/core/utils/async-repository';

/**
 * Repository that encapsulates all data access required by the contacts feature.
 *
 * @remarks
 * The class uses the shared async repository helpers to expose signals that
 * components can bind to without manually handling HTTP state.
 */
@Injectable({
  providedIn: 'root'
})
export class ContactRepository {
  private readonly httpClient = inject(HttpClient);
  // TODO: Replace with real API endpoint when backend is ready
  private readonly baseUrl = '/mocks/contacts.json';

  public mutations() {
    return getMutations({
      create: (contact: ContactRequest) => this.httpClient.post<Contact>(this.baseUrl, contact),
      update: (contact: ContactRequest) =>
        this.httpClient.put<Contact>(`${this.baseUrl}/${contact.id}`, contact),
      delete: (id: string) => this.httpClient.delete<void>(`${this.baseUrl}/${id}`)
    });
  }

  public find(): SignalGet<string, Contact> {
    return getResource<string, Contact>((id: string) => {
      return this.httpClient.get<Contact>(`${this.baseUrl}/${id}`);
    });
  }

  public findBy(): SignalGet<void, Contact[]> {
    return getResource<void, Contact[]>(() => {
      return this.httpClient.get<Contact[]>(this.baseUrl);
    });
  }
}
