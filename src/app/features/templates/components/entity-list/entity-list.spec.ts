import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';

import { EntityList } from './entity-list';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { LayoutManager } from '@/core/services/layout-manager';
import { SignalGet } from '@/core/utils/async-repository';
import { Entity } from '@/features/templates/models/entity';

type TestSignalGet = SignalGet<void, Entity[]> & {
  __setValue: (data: Entity[]) => void;
};

describe('EntityList', () => {
  let component: EntityList;
  let fixture: ComponentFixture<EntityList>;
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
      imports: [EntityList],
      providers: [
        { provide: EntityRepository, useValue: repository },
        { provide: EntityManager, useValue: { open: vi.fn() } },
        { provide: LayoutManager, useValue: { setOverlapped: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityList);
    component = fixture.componentInstance;
  });

  it('should load entities during initialization', async () => {
    component.ngOnInit();
    expect(entitiesResource.load).toHaveBeenCalledTimes(1);
  });

  it('should expose the latest entity list for the template', () => {
    const entities: Entity[] = [
      { id: '1', firstName: 'Jane', lastName: 'Doe', phone: '1', email: 'jane@example.com' }
    ];
    entitiesResource.__setValue(entities);
    expect(component.entities.value()).toEqual(entities);
  });
});
