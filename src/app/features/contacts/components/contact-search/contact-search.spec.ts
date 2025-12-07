import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { ContactSearch } from './contact-search';
import { ContactRepository } from '@/features/contacts/repositories/contact-repository';
import { ContactManager } from '@/features/contacts/managers/contact-manager';
import { LayoutManager } from '@/core/services/layout-manager';
import { SignalGet } from '@/core/utils/async-repository';
import { Contact } from '@/features/contacts/models/contact';

type TestSignalGet = SignalGet<void, Contact[]> & {
  __setValue: (_data: Contact[]) => void;

  __setLoading: (_loading: boolean) => void;
};

describe('ContactSearch', () => {
  let component: ContactSearch;
  let fixture: ComponentFixture<ContactSearch>;
  let repository: jest.Mocked<ContactRepository>;
  let contactsResource: TestSignalGet;
  let mockManager: jest.Mocked<ContactManager>;
  let mockDialogRef: jest.Mocked<MatDialogRef<ContactSearch>>;
  let mockLayoutManager: jest.Mocked<LayoutManager>;

  const createSignalGet = (): TestSignalGet => {
    const valueSignal = signal<Contact[] | null>([]);
    const loadingSignal = signal(false);
    const errorSignal = signal<any | null>(null);
    return {
      value: valueSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      load: jest.fn().mockResolvedValue([]),
      destroy: jest.fn(),
      __setValue: (data: Contact[]) => valueSignal.set(data),
      __setLoading: (loading: boolean) => loadingSignal.set(loading)
    };
  };

  beforeEach(async () => {
    contactsResource = createSignalGet();
    repository = {
      findBy: jest.fn(() => contactsResource)
    } as unknown as jest.Mocked<ContactRepository>;

    mockManager = {
      open: jest.fn()
    } as any;

    mockDialogRef = {
      close: jest.fn()
    } as any;

    mockLayoutManager = {
      getRandomNumber: jest.fn().mockReturnValue(180)
    } as any;

    await TestBed.configureTestingModule({
      imports: [ContactSearch],
      providers: [
        { provide: ContactRepository, useValue: repository },
        { provide: ContactManager, useValue: mockManager },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: LayoutManager, useValue: mockLayoutManager }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactSearch);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load contacts during initialization', () => {
    // Arrange & Act
    component.ngOnInit();

    // Assert
    expect(contactsResource.load).toHaveBeenCalledTimes(1);
  });

  it('should filter contacts by query', () => {
    // Arrange
    const contacts: Contact[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+9876543210',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
    contactsResource.__setValue(contacts);
    component.ngOnInit();
    fixture.detectChanges();

    // Act
    component.form.patchValue({ query: 'John' });
    fixture.detectChanges();

    // Assert
    expect(component.filteredContacts().length).toBe(1);
    expect(component.filteredContacts()[0].firstName).toBe('John');
  });

  it('should filter contacts by email', () => {
    // Arrange
    const contacts: Contact[] = [
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
    contactsResource.__setValue(contacts);
    component.ngOnInit();
    fixture.detectChanges();

    // Act
    component.form.patchValue({ query: 'john@example.com' });
    fixture.detectChanges();

    // Assert
    expect(component.filteredContacts().length).toBe(1);
  });

  it('should filter contacts by company', () => {
    // Arrange
    const contacts: Contact[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
    contactsResource.__setValue(contacts);
    component.ngOnInit();
    fixture.detectChanges();

    // Act
    component.form.patchValue({ query: 'Acme' });
    fixture.detectChanges();

    // Assert
    expect(component.filteredContacts().length).toBe(1);
  });

  it('should return all contacts when query is empty', () => {
    // Arrange
    const contacts: Contact[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+9876543210',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
    contactsResource.__setValue(contacts);
    component.ngOnInit();
    fixture.detectChanges();

    // Act
    component.form.patchValue({ query: '' });
    fixture.detectChanges();

    // Assert
    expect(component.filteredContacts().length).toBe(2);
  });

  it('should show contact and close dialog when contact is selected', () => {
    // Arrange
    const contact: Contact = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    // Act
    component.showContact(contact);

    // Assert
    expect(mockDialogRef.close).toHaveBeenCalled();
    expect(mockManager.open).toHaveBeenCalledWith('123');
  });

  it('should handle case-insensitive search', () => {
    // Arrange
    const contacts: Contact[] = [
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
    contactsResource.__setValue(contacts);
    component.ngOnInit();
    fixture.detectChanges();

    // Act
    component.form.patchValue({ query: 'JOHN' });
    fixture.detectChanges();

    // Assert
    expect(component.filteredContacts().length).toBe(1);
  });

  it('should destroy contacts resource on destroy', () => {
    // Arrange
    const destroySpy = jest.spyOn(contactsResource, 'destroy');

    // Act
    component.ngOnDestroy();

    // Assert
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });
});
