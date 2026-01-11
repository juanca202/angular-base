import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EntityDetail } from './entity-detail';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { LayoutManager } from '@/core/services/layout-manager';
import { Entity } from '@/features/templates/models/entity';
import { of } from 'rxjs';

describe('EntityDetail', () => {
  let component: EntityDetail;
  let fixture: ComponentFixture<EntityDetail>;
  let mockEntityManager: Partial<EntityManager>;
  let mockEntityRepository: Partial<EntityRepository>;
  let mockLayoutManager: Partial<LayoutManager>;
  let mockDialogRef: Partial<MatDialogRef<EntityDetail>>;
  let mockDialogData: { id?: string };

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

  const mockRelatedEntities: Entity[] = [
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '0987654321',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    }
  ];

  beforeEach(async () => {
    // Arrange: Create mocks
    mockEntityManager = {
      search: vi.fn(),
      getContextMenu: vi.fn().mockReturnValue([])
    };

    mockEntityRepository = {
      find: vi.fn().mockReturnValue({
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: vi.fn().mockResolvedValue(mockEntity),
        reload: vi.fn().mockResolvedValue(mockEntity),
        destroy: vi.fn()
      }),
      findBy: vi.fn().mockReturnValue({
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: vi.fn().mockResolvedValue(mockRelatedEntities),
        reload: vi.fn().mockResolvedValue(mockRelatedEntities),
        destroy: vi.fn()
      }),
      change: signal(undefined),
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

    mockDialogData = { id: '1' };

    // Override component before configuring the module
    TestBed.overrideComponent(EntityDetail, {
      remove: { templateUrl: './entity-detail.html', styleUrl: './entity-detail.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [EntityDetail, ReactiveFormsModule, MatDialogModule],
      providers: [
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: EntityRepository, useValue: mockEntityRepository },
        { provide: LayoutManager, useValue: mockLayoutManager },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityDetail);
    component = fixture.componentInstance;
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

    it('should initialize entity resource', () => {
      // Arrange & Act
      const entity = component.entity;

      // Assert
      expect(entity).toBeDefined();
      expect(mockEntityRepository.find).toHaveBeenCalled();
    });

    it('should initialize related entities resource', () => {
      // Arrange & Act
      const related = component.related;

      // Assert
      expect(related).toBeDefined();
      expect(mockEntityRepository.findBy).toHaveBeenCalled();
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
      TestBed.overrideComponent(EntityDetail, {
        remove: { templateUrl: './entity-detail.html', styleUrl: './entity-detail.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      mockDialogData = {};
      const entityLoadSpy = vi.fn().mockResolvedValue(null);
      const relatedLoadSpy = vi.fn().mockResolvedValue([]);
      const entityResource = {
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: entityLoadSpy,
        reload: vi.fn().mockResolvedValue(null),
        destroy: vi.fn()
      };
      const relatedResource = {
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: relatedLoadSpy,
        reload: vi.fn().mockResolvedValue([]),
        destroy: vi.fn()
      };
      mockEntityRepository.find = vi.fn().mockReturnValue(entityResource);
      mockEntityRepository.findBy = vi.fn().mockReturnValue(relatedResource);

      await TestBed.configureTestingModule({
        imports: [EntityDetail, ReactiveFormsModule, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: mockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityDetail);
      component = fixture.componentInstance;

      // Act
      await component.ngOnInit();

      // Assert
      expect(entityLoadSpy).not.toHaveBeenCalled();
      expect(relatedLoadSpy).not.toHaveBeenCalled();
    });

    it('should load entity and related when data has id', async () => {
      // Arrange
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityDetail, {
        remove: { templateUrl: './entity-detail.html', styleUrl: './entity-detail.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      mockDialogData = { id: '1' };
      const entityLoadSpy = vi.fn().mockResolvedValue(mockEntity);
      const relatedLoadSpy = vi.fn().mockResolvedValue(mockRelatedEntities);
      const entityResource = {
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: entityLoadSpy,
        reload: vi.fn().mockResolvedValue(mockEntity),
        destroy: vi.fn()
      };
      const relatedResource = {
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: relatedLoadSpy,
        reload: vi.fn().mockResolvedValue(mockRelatedEntities),
        destroy: vi.fn()
      };
      mockEntityRepository.find = vi.fn().mockReturnValue(entityResource);
      mockEntityRepository.findBy = vi.fn().mockReturnValue(relatedResource);

      await TestBed.configureTestingModule({
        imports: [EntityDetail, ReactiveFormsModule, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: mockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityDetail);
      component = fixture.componentInstance;

      // Act
      await component.ngOnInit();

      // Assert
      expect(entityLoadSpy).toHaveBeenCalledWith('1');
      expect(relatedLoadSpy).toHaveBeenCalled();
    });

    it('should close dialog on error', async () => {
      // Arrange
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityDetail, {
        remove: { templateUrl: './entity-detail.html', styleUrl: './entity-detail.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      mockDialogData = { id: '1' };
      const entityLoadSpy = vi.fn().mockRejectedValue(new Error('Load failed'));
      const relatedLoadSpy = vi.fn().mockResolvedValue([]);
      const entityResource = {
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: entityLoadSpy,
        reload: vi.fn().mockResolvedValue(null),
        destroy: vi.fn()
      };
      const relatedResource = {
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: relatedLoadSpy,
        reload: vi.fn().mockResolvedValue([]),
        destroy: vi.fn()
      };
      mockEntityRepository.find = vi.fn().mockReturnValue(entityResource);
      mockEntityRepository.findBy = vi.fn().mockReturnValue(relatedResource);

      await TestBed.configureTestingModule({
        imports: [EntityDetail, ReactiveFormsModule, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: mockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityDetail);
      component = fixture.componentInstance;

      // Act
      await component.ngOnInit();

      // Assert
      expect(mockDialogRef.close).toHaveBeenCalled();
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
        reload: vi.fn().mockResolvedValue(mockEntity),
        destroy: destroySpy
      };
      const testMockEntityRepository: Partial<EntityRepository> = {
        find: vi.fn().mockReturnValue(entityResource),
        findBy: mockEntityRepository.findBy,
        change: signal(undefined),
        mutations: mockEntityRepository.mutations
      };

      // Recreate component with new mock
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityDetail, {
        remove: { templateUrl: './entity-detail.html', styleUrl: './entity-detail.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      TestBed.configureTestingModule({
        imports: [EntityDetail, ReactiveFormsModule, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: testMockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityDetail);
      component = fixture.componentInstance;

      // Act
      component.ngOnDestroy();

      // Assert
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('addRelation', () => {
    it('should call entityManager.search', () => {
      // Arrange & Act
      component.addRelation();

      // Assert
      expect(mockEntityManager.search).toHaveBeenCalled();
    });
  });

  describe('entity effect', () => {
    it('should refresh entity when repository change occurs', async () => {
      // Arrange
      const reloadSpy = vi.fn().mockResolvedValue(mockEntity);
      const entityResource = {
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: vi.fn().mockResolvedValue(mockEntity),
        reload: reloadSpy,
        destroy: vi.fn()
      };
      const mockChange = { type: 'update' as const, ids: ['1'] };
      const testMockEntityRepository: Partial<EntityRepository> = {
        find: vi.fn().mockReturnValue(entityResource),
        findBy: mockEntityRepository.findBy,
        change: signal(mockChange),
        mutations: mockEntityRepository.mutations
      };

      // Recreate component with new mock
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityDetail, {
        remove: { templateUrl: './entity-detail.html', styleUrl: './entity-detail.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      await TestBed.configureTestingModule({
        imports: [EntityDetail, ReactiveFormsModule, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: testMockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityDetail);
      component = fixture.componentInstance;

      // Act
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      // The effect should trigger refresh when change is detected
      // Note: This test may need adjustment based on how effects work in the test environment
      expect(reloadSpy).toHaveBeenCalled();
    });
  });
});
