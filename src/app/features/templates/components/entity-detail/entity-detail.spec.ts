import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { EntityDetail } from './entity-detail';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { SignalGet } from '@/core/utils/async-repository';
import { Entity } from '@/features/templates/models/entity';
import { LayoutManager } from '@/core/services/layout-manager';

type TestSignalGet = SignalGet<string, Entity> & {
  __setValue: (data: Entity | null) => void;
};

describe('EntityDetail', () => {
  let component: EntityDetail;
  let fixture: ComponentFixture<EntityDetail>;
  let repository: jest.Mocked<EntityRepository>;
  let entityResource: TestSignalGet;
  let mutations: {
    create: jest.Mock;
    update: jest.Mock;
    submitting: ReturnType<typeof signal>;
  };
  let dialogData: any;

  const createResource = (): TestSignalGet => {
    const valueSignal = signal<Entity | null>(null);
    const loadingSignal = signal(false);
    const errorSignal = signal<any | null>(null);
    return {
      value: valueSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      load: jest.fn().mockResolvedValue(null),
      destroy: jest.fn(),
      __setValue: (data: Entity | null) => valueSignal.set(data)
    };
  };

  const createMutations = () => ({
    create: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(null),
    submitting: signal(false).asReadonly()
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(EntityDetail);
    component = fixture.componentInstance;
    return component;
  };

  beforeEach(async () => {
    entityResource = createResource();
    mutations = createMutations();
    repository = {
      find: jest.fn(() => entityResource),
      mutations: jest.fn(() => mutations)
    } as unknown as jest.Mocked<EntityRepository>;
    dialogData = {};

    await TestBed.configureTestingModule({
      imports: [EntityDetail],
      providers: [
        { provide: EntityRepository, useValue: repository },
        { provide: LayoutManager, useValue: { setOverlapped: jest.fn() } },
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

  it('submits an update when editing an existing entity', async () => {
    dialogData.id = 'entity-456';
    const instance = createComponent();
    instance.ngOnInit();

    instance.onSubmit();

    expect(mutations.update).toHaveBeenCalledWith(instance.form.value);
    expect(mutations.create).not.toHaveBeenCalled();
  });

  it('creates a new entity when no identifier is present', () => {
    dialogData = {};
    const instance = createComponent();
    instance.ngOnInit();

    instance.onSubmit();

    expect(mutations.create).toHaveBeenCalledWith(instance.form.value);
    expect(mutations.update).not.toHaveBeenCalled();
  });
});
