import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ContactsRepository } from './contacts-repository';
import { MockHttpClient } from '@/core/utils/mock-http-client';
import { MessageService } from '@factor_ec/ui';

const createMockHttpClient = () => {
  const db: Record<string, any[]> = {};
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

  const parseUrl = (url: string) => {
    const cleaned = url.replace(/^\/+|\/+$/g, '');
    const parts = cleaned.split('/');
    return { collection: parts[0], id: parts[1] };
  };

  return {
    loadCollection: vi.fn((key: string, data: any[]) => {
      db[key] = clone(data);
    }),
    get: vi.fn((url: string) => {
      const { collection, id } = parseUrl(url);
      const items = db[collection] ?? [];
      if (id) return of(clone(items.find((x) => x.id == id)));
      return of(clone(items));
    }),
    post: vi.fn((url: string, body: any) => {
      const { collection } = parseUrl(url);
      db[collection] ??= [];
      const item = { id: 'new-id', ...body };
      db[collection].unshift(item);
      return of(clone(item));
    }),
    put: vi.fn((url: string, body: any) => {
      const { collection, id } = parseUrl(url);
      const idx = (db[collection] ?? []).findIndex((x) => x.id == id);
      if (idx >= 0) db[collection][idx] = { ...db[collection][idx], ...body };
      return of(clone(db[collection][idx]));
    }),
    delete: vi.fn((url: string) => {
      const { collection, id } = parseUrl(url);
      db[collection] = (db[collection] ?? []).filter((x) => x.id != id);
      return of(true as any);
    })
  } as unknown as MockHttpClient;
};

describe('ContactsRepository', () => {
  it('prevents deleting a contact with incoming relationships', async () => {
    const httpClient = createMockHttpClient();

    // Incoming relationship: relatedContactId === "1"
    (httpClient as any).loadCollection('contact-relationships', [
      { id: 'rel-1', contactId: '2', relatedContactId: '1', type: 'FRIEND' }
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: MockHttpClient, useValue: httpClient },
        { provide: MessageService, useValue: { show: vi.fn() } }
      ]
    });

    const repo = TestBed.inject(ContactsRepository);
    const mutations = TestBed.runInInjectionContext(() => repo.mutations());

    await expect(mutations.delete('1')).rejects.toBeTruthy();
  });
});
