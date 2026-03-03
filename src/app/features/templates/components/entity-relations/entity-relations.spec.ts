import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { EntityRelations } from './entity-relations';
import { EntityManager } from '../../managers/entity-manager';
import { EntityRepository } from '../../repositories/entity-repository';
import { UI_OPTIONS } from '@factor_ec/ui';

describe('EntityRelations', () => {
  let component: EntityRelations;
  let fixture: ComponentFixture<EntityRelations>;
  let mockEntityManager: Partial<EntityManager>;
  let mockEntityRepository: Partial<EntityRepository>;
  let mockDialogRef: Partial<MatDialogRef<EntityRelations>>;
  let mockDialogData: { id: string };

  beforeEach(async () => {
    mockEntityManager = {
      search: vi.fn()
    };

    mockEntityRepository = {
      findBy: vi.fn().mockReturnValue({
        value: vi.fn().mockReturnValue(null),
        loading: vi.fn().mockReturnValue(false),
        error: vi.fn().mockReturnValue(null),
        load: vi.fn().mockResolvedValue([]),
        reload: vi.fn().mockResolvedValue([]),
        destroy: vi.fn()
      }),
      change: signal(undefined)
    };

    mockDialogRef = {
      close: vi.fn()
    };

    mockDialogData = { id: '1' };

    await TestBed.configureTestingModule({
      imports: [EntityRelations, MatDialogModule],
      providers: [
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: EntityRepository, useValue: mockEntityRepository },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        {
          provide: UI_OPTIONS,
          useValue: {
            iconSettings: {
              path: 'images',
              collection: 'factoricons-regular'
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityRelations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
