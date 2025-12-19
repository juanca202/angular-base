import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { EntitySearch } from './entity-search';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { LayoutManager } from '@/core/services/layout-manager';
import { SignalGet } from '@/core/utils/async-repository';
import { Entity } from '@/features/templates/models/entity';

type TestSignalGet = SignalGet<void, Entity[]> & {
  __setValue: (data: Entity[]) => void;
};

describe('EntitySearch', () => {
  let component: EntitySearch;
  let fixture: ComponentFixture<EntitySearch>;
  let repository: Partial<EntityRepository>;
  let entitiesResource: TestSignalGet;

  const createSignalGet = (): TestSignalGet => {
    const valueSignal = signal<Entity[] | null>([]);
    const loadingSignal = signal(false);
    const errorSignal = signal<any | null>(null);
    return {
      value: valueSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      load: vi.fn().mockResolvedValue([]),
      destroy: vi.fn(),
      __setValue: (data: Entity[]) => valueSignal.set(data)
    };
  };

  beforeEach(async () => {
    entitiesResource = createSignalGet();
    repository = {
      findBy: vi.fn(() => entitiesResource)
    } as Partial<EntityRepository>;

    await TestBed.configureTestingModule({
      imports: [EntitySearch],
      providers: [
        { provide: EntityRepository, useValue: repository },
        { provide: EntityManager, useValue: { open: vi.fn(), delete: vi.fn(), search: vi.fn() } },
        { provide: LayoutManager, useValue: { setOverlapped: vi.fn() } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EntitySearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
