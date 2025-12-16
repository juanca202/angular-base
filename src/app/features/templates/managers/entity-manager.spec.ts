import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';
import { EntityManager } from './entity-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { MessageService } from '@factor_ec/ui';

describe('EntityManager', () => {
  let service: EntityManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        EntityRepository,
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MessageService, useValue: { show: vi.fn() } }
      ]
    });
    service = TestBed.inject(EntityManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
