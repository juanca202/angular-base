import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EntitySearch } from './entity-search';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { LayoutManager } from '@/core/services/layout-manager';
import { Entity } from '@/features/templates/models/entity';

// Inicializar el entorno de pruebas de Angular si no está inicializado
if (!getTestBed().platform) {
  getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
}

describe('EntitySearch', () => {
  let component: EntitySearch;
  let fixture: ComponentFixture<EntitySearch>;
  let mockEntityManager: Partial<EntityManager>;
  let mockEntityRepository: Partial<EntityRepository>;
  let mockLayoutManager: Partial<LayoutManager>;
  let mockDialogRef: Partial<MatDialogRef<EntitySearch>>;

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

  beforeEach(async () => {
    // Arrange: Create mocks
    mockEntityManager = {
      getContextMenu: vi.fn().mockReturnValue([])
    };

    mockEntityRepository = {
      findBy: vi.fn().mockReturnValue({
        value: vi.fn().mockReturnValue(mockEntities),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: vi.fn().mockResolvedValue(mockEntities),
        refresh: vi.fn().mockResolvedValue(mockEntities),
        destroy: vi.fn()
      })
    };

    mockLayoutManager = {};

    mockDialogRef = {
      close: vi.fn()
    };

    // Override component before configuring the module
    TestBed.overrideComponent(EntitySearch, {
      remove: { templateUrl: './entity-search.html', styleUrl: './entity-search.css' },
      add: { template: '<div>Test</div>', styles: [] }
    });

    await TestBed.configureTestingModule({
      imports: [EntitySearch, ReactiveFormsModule, MatDialogModule],
      providers: [
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: EntityRepository, useValue: mockEntityRepository },
        { provide: LayoutManager, useValue: mockLayoutManager },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EntitySearch);
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

    it('should initialize form with empty query', () => {
      // Arrange & Act
      const form = component.form;

      // Assert
      expect(form).toBeDefined();
      expect(form.get('query')?.value).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('should load entities on init', async () => {
      // Arrange
      const loadSpy = vi.fn().mockResolvedValue(mockEntities);
      const entitiesResource = {
        value: vi.fn().mockReturnValue(mockEntities),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: loadSpy,
        refresh: vi.fn().mockResolvedValue(mockEntities),
        destroy: vi.fn()
      };
      const testMockEntityRepository: Partial<EntityRepository> = {
        findBy: vi.fn().mockReturnValue(entitiesResource)
      };

      // Recreate component with new mock
      TestBed.resetTestingModule();
      TestBed.overrideComponent(EntitySearch, {
        remove: { templateUrl: './entity-search.html', styleUrl: './entity-search.css' },
        add: { template: '<div>Test</div>', styles: [] }
      });
      await TestBed.configureTestingModule({
        imports: [EntitySearch, ReactiveFormsModule, MatDialogModule],
        providers: [
          { provide: EntityManager, useValue: mockEntityManager },
          { provide: EntityRepository, useValue: testMockEntityRepository },
          { provide: LayoutManager, useValue: mockLayoutManager },
          { provide: MatDialogRef, useValue: mockDialogRef }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      fixture = TestBed.createComponent(EntitySearch);
      component = fixture.componentInstance;

      // Act
      component.ngOnInit();
      await fixture.whenStable();

      // Assert
      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('select', () => {
    it('should close dialog and emit selected entity', () => {
      // Arrange
      const selectedEntity = mockEntities[0];
      const selectedSpy = vi.spyOn(component.selected, 'emit');

      // Act
      component.select(selectedEntity);

      // Assert
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(selectedSpy).toHaveBeenCalledWith(selectedEntity);
    });

    it('should emit selected event with correct entity', () => {
      // Arrange
      const selectedEntity = mockEntities[1];
      const selectedSpy = vi.spyOn(component.selected, 'emit');

      // Act
      component.select(selectedEntity);

      // Assert
      expect(selectedSpy).toHaveBeenCalledWith(selectedEntity);
    });
  });
});
