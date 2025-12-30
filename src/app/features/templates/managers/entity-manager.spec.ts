import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';
import { EntityManager } from './entity-manager';
import { EntityRepository } from '@/features/templates/repositories/entity-repository';
import { MessageService } from '@factor_ec/ui';
import { MockHttpClient } from '@/core/utils/mock-http-client';

describe('EntityManager', () => {
  let service: EntityManager;
  let mockMessageService: MessageService;

  beforeEach(() => {
    mockMessageService = {
      show: vi.fn()
    } as unknown as MessageService;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MockHttpClient,
        EntityRepository,
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MessageService, useValue: mockMessageService }
      ]
    });

    service = TestBed.inject(EntityManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
