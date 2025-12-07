import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ContactDetail } from './contact-detail';
import { ContactRepository } from '@/features/contacts/repositories/contact-repository';
import { SignalGet } from '@/core/utils/async-repository';
import { Contact } from '@/features/contacts/models/contact';
import { LayoutManager } from '@/core/services/layout-manager';

type TestSignalGet = SignalGet<string, Contact> & {
  __setValue: (_data: Contact | null) => void;
};

describe('ContactDetail', () => {
  let component: ContactDetail;
  let fixture: ComponentFixture<ContactDetail>;
  let repository: jest.Mocked<ContactRepository>;
  let contactResource: TestSignalGet;
  let mutations: {
    create: jest.Mock;
    update: jest.Mock;
    submitting: ReturnType<typeof signal>;
  };
  let dialogData: any;
  let mockDialogRef: jest.Mocked<MatDialogRef<ContactDetail>>;
  let mockLayoutManager: jest.Mocked<LayoutManager>;

  const createResource = (): TestSignalGet => {
    const valueSignal = signal<Contact | null>(null);
    const loadingSignal = signal(false);
    const errorSignal = signal<any | null>(null);
    return {
      value: valueSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      load: jest.fn().mockResolvedValue(null),
      destroy: jest.fn(),
      __setValue: (data: Contact | null) => valueSignal.set(data)
    };
  };

  const createMutations = () => ({
    create: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(null),
    submitting: signal(false).asReadonly()
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(ContactDetail);
    component = fixture.componentInstance;
    return component;
  };

  beforeEach(async () => {
    contactResource = createResource();
    mutations = createMutations();
    repository = {
      find: jest.fn(() => contactResource),
      mutations: jest.fn(() => mutations)
    } as unknown as jest.Mocked<ContactRepository>;
    dialogData = {};
    mockDialogRef = {
      close: jest.fn()
    } as any;
    mockLayoutManager = {
      setOverlapped: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ContactDetail],
      providers: [
        { provide: ContactRepository, useValue: repository },
        { provide: LayoutManager, useValue: mockLayoutManager },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useFactory: () => dialogData }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const instance = createComponent();
    expect(instance).toBeTruthy();
  });

  it('should load the contact when an identifier is provided', () => {
    // Arrange
    dialogData.id = 'contact-123';
    const instance = createComponent();

    // Act
    instance.ngOnInit();

    // Assert
    expect(contactResource.load).toHaveBeenCalledWith('contact-123');
  });

  it('should not load contact when no identifier is provided', () => {
    // Arrange
    dialogData = {};
    const instance = createComponent();

    // Act
    instance.ngOnInit();

    // Assert
    expect(contactResource.load).not.toHaveBeenCalled();
  });

  it('should patch form values when contact is loaded', async () => {
    // Arrange
    dialogData.id = 'contact-123';
    const mockContact: Contact = {
      id: 'contact-123',
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
    contactResource.load = jest.fn().mockResolvedValue(mockContact);
    const instance = createComponent();
    const patchValueSpy = jest.spyOn(instance.form, 'patchValue');

    // Act
    instance.ngOnInit();
    await fixture.whenStable();

    // Assert
    expect(patchValueSpy).toHaveBeenCalledWith(mockContact);
  });

  it('should submit an update when editing an existing contact', async () => {
    // Arrange
    dialogData.id = 'contact-456';
    const instance = createComponent();
    instance.form.patchValue({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+9876543210'
    });

    // Act
    await instance.onSubmit();

    // Assert
    expect(mutations.update).toHaveBeenCalledWith({
      ...instance.form.value,
      id: 'contact-456'
    });
    expect(mutations.create).not.toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should create a new contact when no identifier is present', async () => {
    // Arrange
    dialogData = {};
    const instance = createComponent();
    instance.form.patchValue({
      firstName: 'New',
      lastName: 'Contact',
      email: 'new@example.com',
      phone: '+1111111111'
    });

    // Act
    await instance.onSubmit();

    // Assert
    expect(mutations.create).toHaveBeenCalledWith(instance.form.value);
    expect(mutations.update).not.toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should not submit when form is invalid', async () => {
    // Arrange
    dialogData = {};
    const instance = createComponent();
    instance.form.patchValue({
      firstName: '', // Invalid - required
      lastName: '',
      email: 'invalid-email', // Invalid email
      phone: ''
    });

    // Act
    await instance.onSubmit();

    // Assert
    expect(mutations.create).not.toHaveBeenCalled();
    expect(mutations.update).not.toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should destroy contact resource on destroy', () => {
    // Arrange
    const instance = createComponent();
    const destroySpy = jest.spyOn(contactResource, 'destroy');

    // Act
    instance.ngOnDestroy();

    // Assert
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  it('should not close dialog when mutation fails', async () => {
    // Arrange
    dialogData = {};
    mutations.create = jest.fn().mockRejectedValue(new Error('API Error'));
    const instance = createComponent();
    instance.form.patchValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+1234567890'
    });

    // Act
    await instance.onSubmit();

    // Assert
    expect(mutations.create).toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
