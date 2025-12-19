import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { vi } from 'vitest';

import { EntityDetail } from './entity-detail';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { SignalGet } from '@/core/utils/async-repository';
import { Entity } from '@/features/templates/models/entity';
import { LayoutManager } from '@/core/services/layout-manager';
import { EntityManager } from '@/features/templates/managers/entity-manager';

type TestSignalGet = SignalGet<string, Entity> & {
  __setValue: (data: Entity | null) => void;
};

describe('EntityDetail', () => {
  let component: EntityDetail;
  let fixture: ComponentFixture<EntityDetail>;
  let repository: Partial<EntityRepository>;
  let entityResource: TestSignalGet;
  let mutations: any;
  let dialogData: any;

  const createResource = (): TestSignalGet => {
    const valueSignal = signal<Entity | null>(null);
    const loadingSignal = signal(false);
    const errorSignal = signal<any | null>(null);
    return {
      value: valueSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      load: vi.fn().mockResolvedValue(null),
      refresh: vi.fn().mockResolvedValue(null),
      destroy: vi.fn(),
      __setValue: (data: Entity | null) => valueSignal.set(data)
    };
  };

  const createMutations = () => {
    const createFn = vi.fn().mockResolvedValue(null) as any;
    const updateFn = vi.fn().mockResolvedValue(null) as any;
    const deleteFn = vi.fn().mockResolvedValue(null) as any;

    createFn.submitting = signal(false).asReadonly();
    createFn.value = signal<Entity | null>(null).asReadonly();
    createFn.error = signal<any | null>(null).asReadonly();

    updateFn.submitting = signal(false).asReadonly();
    updateFn.value = signal<Entity | null>(null).asReadonly();
    updateFn.error = signal<any | null>(null).asReadonly();

    deleteFn.submitting = signal(false).asReadonly();
    deleteFn.value = signal<void | null>(null).asReadonly();
    deleteFn.error = signal<any | null>(null).asReadonly();

    return {
      create: createFn,
      update: updateFn,
      delete: deleteFn,
      submitting: signal(false).asReadonly(),
      error: signal<any | null>(null).asReadonly()
    };
  };

  const createComponent = () => {
    fixture = TestBed.createComponent(EntityDetail);
    component = fixture.componentInstance;
    return component;
  };

  beforeEach(async () => {
    entityResource = createResource();
    mutations = createMutations();
    repository = {
      find: vi.fn(() => entityResource),
      mutations: vi.fn(() => mutations)
    } as unknown as Partial<EntityRepository>;
    dialogData = {};

    await TestBed.configureTestingModule({
      imports: [EntityDetail],
      providers: [
        { provide: EntityRepository, useValue: repository },
        { provide: EntityManager, useValue: { open: vi.fn(), delete: vi.fn(), search: vi.fn() } },
        { provide: LayoutManager, useValue: { setOverlapped: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useFactory: () => dialogData }
      ]
    }).compileComponents();
  });

  it('loads the entity when an identifier is provided', () => {
    dialogData.id = 'entity-123';
    const instance = createComponent();
    instance.ngOnInit();

    expect(entityResource.load).toHaveBeenCalledWith('entity-123');
  });

  it('does not load entity when no identifier is provided', () => {
    dialogData = {};
    const instance = createComponent();
    instance.ngOnInit();

    expect(entityResource.load).not.toHaveBeenCalled();
  });

  it('destroys entity resource on component destroy', () => {
    dialogData.id = 'entity-123';
    const instance = createComponent();
    instance.ngOnInit();
    instance.ngOnDestroy();

    expect(entityResource.destroy).toHaveBeenCalled();
  });
});
