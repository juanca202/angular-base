import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EntityList } from './entity-list';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { LayoutManager } from '@/core/services/layout-manager';
import { Entity } from '@/features/templates/models/entity';

describe('EntityList', () => {
  let component: EntityList;
  let fixture: ComponentFixture<EntityList>;
  let mockEntityManager: Partial<EntityManager>;
  let mockEntityRepository: Partial<EntityRepository>;
  let mockLayoutManager: Partial<LayoutManager>;

  beforeEach(async () => {
    // Arrange: Create mocks
    const mockEntities: Entity[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        company: 'Test Company',
        position: 'Developer',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
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

    mockEntityManager = {
      getContextMenu: vi.fn().mockReturnValue([])
    };

    mockEntityRepository = {
      findBy: vi.fn().mockReturnValue({
        value: vi.fn().mockReturnValue(mockEntities),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: vi.fn().mockResolvedValue(mockEntities),
        reload: vi.fn().mockResolvedValue(mockEntities),
        destroy: vi.fn()
      }),
      change: signal(undefined)
    };

    mockLayoutManager = {};

    // Override component before configuring the module
    TestBed.overrideComponent(EntityList, {
      remove: { templateUrl: './entity-list.html', styleUrl: './entity-list.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [EntityList, RouterModule],
      providers: [
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: EntityRepository, useValue: mockEntityRepository },
        { provide: LayoutManager, useValue: mockLayoutManager }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityList);
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
    });

    it('should initialize entities resource', () => {
      // Arrange & Act
      const entities = component.entities;

      // Assert
      expect(entities).toBeDefined();
      expect(mockEntityRepository.findBy).toHaveBeenCalled();
    });

    it('should have ENTITY_CONTEXT constant', () => {
      // Arrange & Act & Assert
      expect(component.ENTITY_CONTEXT).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call load on entities with notifyError false', async () => {
      // Arrange
      const loadSpy = vi.fn().mockResolvedValue([]);
      const entitiesResource = {
        value: vi.fn().mockReturnValue([]),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: loadSpy,
        reload: vi.fn().mockResolvedValue([]),
        destroy: vi.fn()
      };
      mockEntityRepository.findBy = vi.fn().mockReturnValue(entitiesResource);

      // Recreate component with new mock
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityList, {
        remove: { templateUrl: './entity-list.html', styleUrl: './entity-list.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      await TestBed.configureTestingModule({
        imports: [EntityList, RouterModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: mockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityList);
      component = fixture.componentInstance;

      // Act
      component.ngOnInit();
      await fixture.whenStable();

      // Assert
      expect(loadSpy).toHaveBeenCalledWith(undefined, { notifyError: false });
    });
  });

  describe('ngOnDestroy', () => {
    it('should destroy entities resource', () => {
      // Arrange
      const destroySpy = vi.fn();
      const entitiesResource = {
        value: vi.fn().mockReturnValue([]),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: vi.fn().mockResolvedValue([]),
        reload: vi.fn().mockResolvedValue([]),
        destroy: destroySpy
      };
      mockEntityRepository.findBy = vi.fn().mockReturnValue(entitiesResource);

      // Recreate component with new mock
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityList, {
        remove: { templateUrl: './entity-list.html', styleUrl: './entity-list.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      TestBed.configureTestingModule({
        imports: [EntityList, RouterModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: mockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityList);
      component = fixture.componentInstance;

      // Act
      component.ngOnDestroy();

      // Assert
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('entities effect', () => {
    it('should refresh entities when repository change occurs', async () => {
      // Arrange
      const reloadSpy = vi.fn().mockResolvedValue([]);
      const entitiesResource = {
        value: vi.fn().mockReturnValue([]),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: vi.fn().mockResolvedValue([]),
        reload: reloadSpy,
        destroy: vi.fn()
      };
      const mockChange = { type: 'create' as const, ids: ['1'] };
      const testMockEntityRepository: Partial<EntityRepository> = {
        findBy: vi.fn().mockReturnValue(entitiesResource),
        change: signal(mockChange)
      };

      // Recreate component with new mock
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntityList, {
        remove: { templateUrl: './entity-list.html', styleUrl: './entity-list.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      await TestBed.configureTestingModule({
        imports: [EntityList, RouterModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: testMockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntityList);
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
