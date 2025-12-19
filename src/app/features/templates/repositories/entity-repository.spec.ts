import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { EntityRepository } from './entity-repository';
import { Entity, EntityRequest } from '@/features/templates/models/entity';
import { MessageService } from '@factor_ec/ui';
import { MockHttpClient } from '@/core/utils/mock-http-client';

describe('EntityRepository', () => {
  let repository: EntityRepository;
  let mockHttpClient: {
    loadCollection: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockHttpClient = {
      loadCollection: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: MessageService, useValue: { show: vi.fn() } },
        { provide: MockHttpClient, useValue: mockHttpClient }
      ]
    });

    repository = TestBed.inject(EntityRepository);
  });

  it('loads a single entity by identifier', async () => {
    const resource = repository.find();
    const expected: Entity = {
      id: '123',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '555-1234',
      email: 'jane@example.com'
    };

    mockHttpClient.get.mockReturnValue(of(expected));

    const promise = resource.load('123');

    await expect(promise).resolves.toEqual(expected);
    expect(resource.value()).toEqual(expected);
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  it('loads the entity collection', async () => {
    const resource = repository.findBy();
    const expected: Entity[] = [
      { id: '1', firstName: 'A', lastName: 'B', phone: '1', email: 'a@example.com' }
    ];

    mockHttpClient.get.mockReturnValue(of(expected));

    const promise = resource.load();

    await expect(promise).resolves.toEqual(expected);
    expect(resource.value()).toEqual(expected);
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  it('creates a new entity', async () => {
    const mutations = TestBed.runInInjectionContext(() => repository.mutations());
    const payload: EntityRequest = {
      firstName: 'New',
      lastName: 'Customer',
      phone: '123',
      email: 'new@example.com'
    };

    // Ensure the collection resource has been loaded at least once so refresh() works.
    mockHttpClient.get.mockReturnValue(of([]));
    await repository.findBy().load();

    mockHttpClient.post.mockReturnValue(of({ ...payload, id: '999' }));

    const promise = mutations.create(payload);

    await expect(promise).resolves.toEqual({ ...payload, id: '999' });
    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
  });
});
