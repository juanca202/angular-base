import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ContactList } from './contact-list';
import { ContactRepository } from '@/features/contacts/repositories/contact-repository';
import { ContactManager } from '@/features/contacts/managers/contact-manager';
import { LayoutManager } from '@/core/services/layout-manager';
import { SignalGet } from '@/core/utils/async-repository';
import { Contact } from '@/features/contacts/models/contact';

type TestSignalGet = SignalGet<void, Contact[]> & {
  __setValue: (_data: Contact[]) => void;

  __setLoading: (_loading: boolean) => void;

  __setError: (_error: any) => void;
};

describe('ContactList', () => {
  let component: ContactList;
  let fixture: ComponentFixture<ContactList>;
  let repository: jest.Mocked<ContactRepository>;
  let contactsResource: TestSignalGet;
  let mockManager: jest.Mocked<ContactManager>;
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
      __setLoading: (loading: boolean) => loadingSignal.set(loading),
      __setError: (error: any) => errorSignal.set(error)
    };
  };

  beforeEach(async () => {
    contactsResource = createSignalGet();
    repository = {
      findBy: jest.fn(() => contactsResource)
    } as unknown as jest.Mocked<ContactRepository>;

    mockManager = {
      open: jest.fn(),
      search: jest.fn()
    } as any;

    mockLayoutManager = {
      setOverlapped: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ContactList],
      providers: [
        { provide: ContactRepository, useValue: repository },
        { provide: ContactManager, useValue: mockManager },
        { provide: LayoutManager, useValue: mockLayoutManager }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactList);
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

  it('should expose the latest contact list for the template', () => {
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

    // Act
    contactsResource.__setValue(contacts);

    // Assert
    expect(component.contacts.value()).toEqual(contacts);
  });

  it('should expose loading state', () => {
    // Arrange & Act
    contactsResource.__setLoading(true);

    // Assert
    expect(component.contacts.loading()).toBe(true);
  });

  it('should expose error state', () => {
    // Arrange
    const error = 'Error loading contacts';

    // Act
    contactsResource.__setError(error);

    // Assert
    expect(component.contacts.error()).toBe(error);
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
