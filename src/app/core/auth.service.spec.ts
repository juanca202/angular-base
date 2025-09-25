import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from 'app/core/auth.service';
import { StorageService } from '@factor_ec/utils';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        AuthService,
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        {
          provide: StorageService,
          useValue: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
        },
        {
          provide: 'RestService',
          useValue: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
        },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
