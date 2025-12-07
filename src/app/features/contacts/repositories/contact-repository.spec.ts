import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ContactRepository } from './contact-repository';
import { Contact, ContactRequest } from '@/features/contacts/models/contact';
import { MessageService } from '@factor_ec/ui';

describe('ContactRepository', () => {
  let repository: ContactRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: MessageService, useValue: { show: jest.fn() } }]
    });

    repository = TestBed.inject(ContactRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  it('should load a single contact by identifier', async () => {
    // Arrange
    const resource = TestBed.runInInjectionContext(() => repository.find());
    const expected: Contact = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      position: 'Developer',
      notes: 'Test notes',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    // Act
    const promise = resource.load('123');

    // Assert
    const request = httpMock.expectOne('/mocks/contacts.json/123');
    expect(request.request.method).toBe('GET');
    request.flush(expected);

    await expect(promise).resolves.toEqual(expected);
    expect(resource.value()).toEqual(expected);
  });

  it('should load the contact collection', async () => {
    // Arrange
    const resource = TestBed.runInInjectionContext(() => repository.findBy());
    const expected: Contact[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    // Act
    const promise = resource.load();

    // Assert
    const request = httpMock.expectOne('/mocks/contacts.json');
    expect(request.request.method).toBe('GET');
    request.flush(expected);

    await expect(promise).resolves.toEqual(expected);
    expect(resource.value()).toEqual(expected);
  });

  it('should create a new contact', async () => {
    // Arrange
    const mutations = TestBed.runInInjectionContext(() => repository.mutations());
    const payload: ContactRequest = {
      firstName: 'New',
      lastName: 'Contact',
      email: 'new@example.com',
      phone: '+1111111111',
      company: 'New Company',
      position: 'Manager'
    };

    // Act
    const promise = mutations.create(payload);

    // Assert
    const request = httpMock.expectOne('/mocks/contacts.json');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      ...payload,
      id: '999',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    });

    await expect(promise).resolves.toEqual({
      ...payload,
      id: '999',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    });
  });

  it('should update an existing contact', async () => {
    // Arrange
    const mutations = TestBed.runInInjectionContext(() => repository.mutations());
    const payload: ContactRequest = {
      id: '123',
      firstName: 'Updated',
      lastName: 'Contact',
      email: 'updated@example.com',
      phone: '+2222222222',
      company: 'Updated Company'
    };

    // Act
    const promise = mutations.update(payload);

    // Assert
    const request = httpMock.expectOne('/mocks/contacts.json/123');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ ...payload, updatedAt: '2024-01-02T00:00:00Z' });

    await expect(promise).resolves.toEqual({
      ...payload,
      updatedAt: '2024-01-02T00:00:00Z'
    });
  });

  it('should delete a contact', async () => {
    // Arrange
    const mutations = TestBed.runInInjectionContext(() => repository.mutations());

    // Act
    const promise = mutations.delete('123');

    // Assert
    const request = httpMock.expectOne('/mocks/contacts.json/123');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    await expect(promise).resolves.toBeNull();
  });
});
