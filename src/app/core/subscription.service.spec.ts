import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { SubscriptionService } from './subscription.service';
import { StorageService, GoogleTagManagerService } from '@factor_ec/utils';
import { MessageService } from '@factor_ec/ui';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        SubscriptionService,
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        {
          provide: StorageService,
          useValue: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
        },
        { provide: GoogleTagManagerService, useValue: { push: jest.fn() } },
        {
          provide: MessageService,
          useValue: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
        },
        {
          provide: 'RestService',
          useValue: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
        },
      ],
    });
    service = TestBed.inject(SubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
