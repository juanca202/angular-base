import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EntityForm } from './entity-form';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { LayoutManager } from '@/core/services/layout-manager';
import { notificationEvents, type NotificationEvent } from '@/core/utils/notification';
import { getNotificationDetail } from '@/test/helpers/notification-event.helpers';
import { Entity } from '@/features/templates/models/entity';
import { OPERATION_TYPE } from '@/core/constants/operation-type';
import { of } from 'rxjs';

describe('EntityForm', () => {
  let component: EntityForm;
  let fixture: ComponentFixture<EntityForm>;
  let mockEntityManager: Partial<EntityManager>;
  let mockEntityRepository: Partial<EntityRepository>;
  let mockLayoutManager: Partial<LayoutManager>;
  let mockDialogRef: Partial<MatDialogRef<EntityForm>>;
  let mockDialogData: { id?: string };
  let notifiedEvents: NotificationEvent[];

  const notifyHandler = (event: Event): void => {
    notifiedEvents.push(getNotificationDetail(event));
  };

  const mockEntity: Entity = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    company: 'Test Company',
    position: 'Developer',
    notes: 'Test notes',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  beforeEach(async () => {
    notifiedEvents = [];
    notificationEvents.addEventListener('notify', notifyHandler);

    // Arrange: Create mocks
    mockEntityManager = {
      getContextMenu: vi.fn().mockReturnValue([])
    };

    mockEntityRepository = {
      find: vi.fn().mockReturnValue({
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: vi.fn().mockResolvedValue(mockEntity),
        refresh: vi.fn().mockResolvedValue(mockEntity),
        destroy: vi.fn()
      }),
      mutations: vi.fn().mockReturnValue({
        create: vi.fn().mockReturnValue(of(mockEntity)),
        update: vi.fn().mockReturnValue(of(mockEntity)),
        delete: vi.fn().mockReturnValue(of(void 0)),
        submitting: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null)
      })
    };

    mockLayoutManager = {};

    mockDialogRef = {
      close: vi.fn()
    };

    mockDialogData = {};

    // Override component before configuring the module
    TestBed.overrideComponent(EntityForm, {
      remove: { templateUrl: './entity-form.html', styleUrl: './entity-form.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [EntityForm, MatDialogModule],
      providers: [
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: EntityRepository, useValue: mockEntityRepository },
        { provide: LayoutManager, useValue: mockLayoutManager },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityForm);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    notificationEvents.removeEventListener('notify', notifyHandler);
  });

  describe('initialization', () => {
    it('should create component', () => {
      // Arrange & Act & Assert
      expect(component).toBeTruthy();
    });

    it('should inject dependencies', () => {
      // Arrange & Act & Assert
      expect(component.entityManager).toBeDefined();
      expect(component.layoutManager).toBeDefined();
      expect(component.data).toBeDefined();
    });

    it('should initialize form with empty values', () => {
      // Arrange & Act
      const model = component.entityModel();

      // Assert
      expect(component.entityForm).toBeDefined();
      expect(model.firstName).toBe('');
      expect(model.lastName).toBe('');
      expect(model.email).toBe('');
      expect(model.phone).toBe('');
      expect(model.company).toBe('');
      expect(model.position).toBe('');
      expect(model.notes).toBe('');
    });

    it('should have form validators', () => {
      // Arrange & Act
      const form = component.entityForm;

      // Assert
      expect(form.firstName().invalid()).toBe(true);
      expect(form.lastName().invalid()).toBe(true);
      expect(form.email().invalid()).toBe(true);
      expect(form.phone().invalid()).toBe(true);
    });

    it('should have ENTITY_CONTEXT constant', () => {
      // Arrange & Act & Assert
      expect(component.ENTITY_CONTEXT).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should not load entity when data has no id', async () => {
      // Arrange
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityForm, {
        remove: { templateUrl: './entity-form.html', styleUrl: './entity-form.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      mockDialogData = {};
      const loadSpy = vi.fn().mockResolvedValue(null);
      const entityResource = {
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: loadSpy,
        refresh: vi.fn().mockResolvedValue(null),
        destroy: vi.fn()
      };
      mockEntityRepository.find = vi.fn().mockReturnValue(entityResource);

      await TestBed.configureTestingModule({
        imports: [EntityForm, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: mockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityForm);
      component = fixture.componentInstance;

      // Act
      component.ngOnInit();
      await fixture.whenStable();

      // Assert
      expect(loadSpy).not.toHaveBeenCalled();
    });

    it('should load and patch entity when data has id', async () => {
      // Arrange
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityForm, {
        remove: { templateUrl: './entity-form.html', styleUrl: './entity-form.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      mockDialogData = { id: '1' };
      const loadSpy = vi.fn().mockResolvedValue(mockEntity);
      const entityResource = {
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: loadSpy,
        refresh: vi.fn().mockResolvedValue(mockEntity),
        destroy: vi.fn()
      };
      mockEntityRepository.find = vi.fn().mockReturnValue(entityResource);

      await TestBed.configureTestingModule({
        imports: [EntityForm, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: mockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityForm);
      component = fixture.componentInstance;
      const modelSetSpy = vi.spyOn(component.entityModel, 'set');

      // Act
      component.ngOnInit();
      await fixture.whenStable();

      // Assert
      expect(loadSpy).toHaveBeenCalledWith('1');
      expect(modelSetSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: mockEntity.firstName,
          lastName: mockEntity.lastName,
          email: mockEntity.email,
          phone: mockEntity.phone
        })
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should destroy entity resource', () => {
      // Arrange
      const destroySpy = vi.fn();
      const entityResource = {
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: vi.fn().mockResolvedValue(mockEntity),
        refresh: vi.fn().mockResolvedValue(mockEntity),
        destroy: destroySpy
      };
      const testMockEntityRepository: Partial<EntityRepository> = {
        find: vi.fn().mockReturnValue(entityResource),
        mutations: mockEntityRepository.mutations
      };

      // Recreate component with new mock
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityForm, {
        remove: { templateUrl: './entity-form.html', styleUrl: './entity-form.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      TestBed.configureTestingModule({
        imports: [EntityForm, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: testMockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityForm);
      component = fixture.componentInstance;

      // Act
      component.ngOnDestroy();

      // Assert
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should not submit when form is invalid', async () => {
      // Arrange - form starts invalid (empty required fields)
      const createSpy = vi.spyOn(component.entityMutations, 'create');
      const updateSpy = vi.spyOn(component.entityMutations, 'update');
      const event = { preventDefault: vi.fn() } as unknown as Event;

      // Act
      await component.onSubmit(event);

      // Assert
      expect(createSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should create entity when form is valid and no id in data', async () => {
      // Arrange
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityForm, {
        remove: { templateUrl: './entity-form.html', styleUrl: './entity-form.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      mockDialogData = {};
      const createSpy = vi.fn().mockResolvedValue(mockEntity);
      const mutations = {
        create: createSpy,
        update: vi.fn(),
        delete: vi.fn(),
        submitting: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null)
      };
      mockEntityRepository.mutations = vi.fn().mockReturnValue(mutations);

      await TestBed.configureTestingModule({
        imports: [EntityForm, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: mockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityForm);
      component = fixture.componentInstance;
      component.entityModel.set({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        company: '',
        position: '',
        notes: ''
      });
      const afterSubmitSpy = vi.spyOn(component.afterSubmit, 'emit');
      const event = { preventDefault: vi.fn() } as unknown as Event;

      // Act
      await component.onSubmit(event);

      // Assert
      expect(createSpy).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(notifiedEvents).toHaveLength(1);
      expect(notifiedEvents[0].options).toEqual({ level: 'success' });
      expect(afterSubmitSpy).toHaveBeenCalledWith({
        type: OPERATION_TYPE.CREATE,
        entity: mockEntity
      });
    });

    it('should update entity when form is valid and id in data', async () => {
      // Arrange
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityForm, {
        remove: { templateUrl: './entity-form.html', styleUrl: './entity-form.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      mockDialogData = { id: '1' };
      const updateSpy = vi.fn().mockResolvedValue(mockEntity);
      const mutations = {
        create: vi.fn(),
        update: updateSpy,
        delete: vi.fn(),
        submitting: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null)
      };
      mockEntityRepository.mutations = vi.fn().mockReturnValue(mutations);

      await TestBed.configureTestingModule({
        imports: [EntityForm, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: mockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityForm);
      component = fixture.componentInstance;
      component.entityModel.set({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        company: '',
        position: '',
        notes: ''
      });
      const afterSubmitSpy = vi.spyOn(component.afterSubmit, 'emit');
      const event = { preventDefault: vi.fn() } as unknown as Event;

      // Act
      await component.onSubmit(event);

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          id: '1'
        })
      );
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(notifiedEvents).toHaveLength(1);
      expect(notifiedEvents[0].options).toEqual({ level: 'success' });
      expect(afterSubmitSpy).toHaveBeenCalledWith({
        type: OPERATION_TYPE.UPDATE,
        entity: mockEntity
      });
    });

    it('should submit when form is valid', async () => {
      // Arrange
      component.entityModel.set({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        company: '',
        position: '',
        notes: ''
      });
      const createSpy = vi
        .spyOn(component.entityMutations, 'create')
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(mockEntity), 100))
        );
      const event = { preventDefault: vi.fn() } as unknown as Event;

      // Act
      const submitPromise = component.onSubmit(event);
      await submitPromise;

      // Assert
      expect(createSpy).toHaveBeenCalled();
    });
  });
});
