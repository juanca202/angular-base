import { TestBed } from '@angular/core/testing';
import { StorageService } from '@factor_ec/utils';
import { vi } from 'vitest';

import { Session } from './session';

describe('Session', () => {
  let service: Session;
  let mockStorageService: StorageService;

  beforeEach(() => {
    mockStorageService = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      delete: vi.fn(),
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    } as unknown as StorageService;

    TestBed.configureTestingModule({
      providers: [
        {
          provide: StorageService,
          useValue: mockStorageService
        }
      ]
    });

    service = TestBed.inject(Session);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
