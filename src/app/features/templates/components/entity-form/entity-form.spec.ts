import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { EntityForm } from './entity-form';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { LayoutManager } from '@/core/services/layout-manager';
import { MessageService } from '@factor_ec/ui';
import { SignalGet } from '@/core/utils/async-repository';
import { Entity } from '@/features/templates/models/entity';

type TestSignalGet = SignalGet<string, Entity> & {
  __setValue: (data: Entity | null) => void;
};

describe('EntityForm', () => {
  let component: EntityForm;
  let fixture: ComponentFixture<EntityForm>;
  let repository: Partial<EntityRepository>;
  let entityResource: TestSignalGet;
  let mutations: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    submitting: ReturnType<typeof signal>;
  };

  const createResource = (): TestSignalGet => {
    const valueSignal = signal<Entity | null>(null);
    const loadingSignal = signal(false);
    const errorSignal = signal<any | null>(null);
    return {
      value: valueSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      load: vi.fn().mockResolvedValue(null),
      destroy: vi.fn(),
      __setValue: (data: Entity | null) => valueSignal.set(data)
    };
  };

  const createMutations = () => ({
    create: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(null),
    submitting: signal(false).asReadonly()
  });

  beforeEach(async () => {
    entityResource = createResource();
    mutations = createMutations();
    repository = {
      find: vi.fn(() => entityResource),
      mutations: vi.fn(() => mutations)
    } as Partial<EntityRepository>;

    await TestBed.configureTestingModule({
      imports: [EntityForm],
      providers: [
        { provide: EntityRepository, useValue: repository },
        { provide: EntityManager, useValue: { open: vi.fn(), delete: vi.fn(), search: vi.fn() } },
        { provide: LayoutManager, useValue: { setOverlapped: vi.fn() } },
        { provide: MessageService, useValue: { show: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: { close: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
