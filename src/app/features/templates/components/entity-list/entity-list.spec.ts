import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';

import { EntityList } from './entity-list';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { EntityManager } from '@/features/templates/managers/entity-manager';
import { LayoutManager } from '@/core/services/layout-manager';
import { MockHttpClient } from '@/core/utils/mock-http-client';
import { MessageService } from '@factor_ec/ui';
import { SignalGet } from '@/core/utils/async-repository';
import { Entity } from '@/features/templates/models/entity';

type TestSignalGet = SignalGet<void, Entity[]> & {
  __setValue: (data: Entity[]) => void;
};

describe('EntityList', () => {
  let component: EntityList;
  let fixture: ComponentFixture<EntityList>;
  let repository: EntityRepository;
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
      refresh: vi.fn().mockResolvedValue([]),
      __setValue: (data: Entity[]) => valueSignal.set(data)
    };
  };

  beforeEach(async () => {
    entitiesResource = createSignalGet();

    await TestBed.configureTestingModule({
      imports: [EntityList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MockHttpClient,
        EntityRepository,
        EntityManager,
        LayoutManager,
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MessageService, useValue: { show: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityList);
    component = fixture.componentInstance;
    repository = TestBed.inject(EntityRepository);

    // Mock the findBy method to return our test resource
    vi.spyOn(repository, 'findBy').mockReturnValue(entitiesResource as any);
  });

  it('should load entities during initialization', async () => {
    component.ngOnInit();
    expect(entitiesResource.load).toHaveBeenCalledTimes(1);
  });

  it('should expose the latest entity list for the template', () => {
    const entities: Entity[] = [
      {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '1',
        email: 'jane@example.com',
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01'
      }
    ];
    entitiesResource.__setValue(entities);
    expect(component.entities.value()).toEqual(entities);
  });
});
