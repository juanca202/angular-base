import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { EntityRepository } from './entity-repository';
import { Entity, EntityRequest } from '@/features/templates/models/entity';
import { MessageService } from '@factor_ec/ui';

describe('EntityRepository', () => {
  let repository: EntityRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: MessageService, useValue: { show: vi.fn() } }]
    });

    repository = TestBed.inject(EntityRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
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

    const promise = resource.load('123');

    const request = httpMock.expectOne('/v1/entities/123');
    expect(request.request.method).toBe('GET');
    request.flush(expected);

    await expect(promise).resolves.toEqual(expected);
    expect(resource.value()).toEqual(expected);
  });

  it('loads the entity collection', async () => {
    const resource = repository.findBy();
    const expected: Entity[] = [
      { id: '1', firstName: 'A', lastName: 'B', phone: '1', email: 'a@example.com' }
    ];

    const promise = resource.load();

    const request = httpMock.expectOne('/v1/entities');
    expect(request.request.method).toBe('GET');
    request.flush(expected);

    await expect(promise).resolves.toEqual(expected);
    expect(resource.value()).toEqual(expected);
  });

  it('creates a new entity', async () => {
    const mutations = repository.mutations();
    const payload: EntityRequest = {
      firstName: 'New',
      lastName: 'Customer',
      phone: '123',
      email: 'new@example.com'
    };

    const promise = mutations.create(payload);

    const request = httpMock.expectOne('/v1/entities');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ ...payload, id: '999' });

    await expect(promise).resolves.toEqual({ ...payload, id: '999' });
  });
});
