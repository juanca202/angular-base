import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ContactRelationshipsRepository } from './contact-relationships-repository';
import { MockHttpClient } from '@/core/utils/mock-http-client';
import { MessageService } from '@factor_ec/ui';

describe('ContactRelationshipsRepository', () => {
  it('rejects self relationships', async () => {
    const httpClient = {
      loadCollection: vi.fn(),
      get: vi.fn(() => of([])),
      post: vi.fn(() => of(null)),
      put: vi.fn(() => of(null)),
      delete: vi.fn(() => of(null))
    } as unknown as MockHttpClient;

    TestBed.configureTestingModule({
      providers: [
        { provide: MockHttpClient, useValue: httpClient },
        { provide: MessageService, useValue: { show: vi.fn() } }
      ]
    });

    const repo = TestBed.inject(ContactRelationshipsRepository);
    const mutations = TestBed.runInInjectionContext(() => repo.mutations());

    await expect(
      mutations.create({ contactId: '1', relatedContactId: '1', type: 'FRIEND' })
    ).rejects.toBeTruthy();
  });
});
