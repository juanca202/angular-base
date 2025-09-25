import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { AppService } from 'app/core/app.service';
import { StorageService, GoogleTagManagerService } from '@factor_ec/utils';
jest.mock('version-info', () => ({
  versionInfo: {
    version: 'test',
    hash: 'abc',
    git: {
      raw: 'test-version',
    },
  },
}));

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        AppService,
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
        { provide: Location, useValue: { back: jest.fn(), forward: jest.fn(), go: jest.fn() } },
        {
          provide: SwUpdate,
          useValue: {
            available: { subscribe: jest.fn() },
            activated: { subscribe: jest.fn() },
            versionUpdates: { subscribe: jest.fn() },
          },
        },
        {
          provide: StorageService,
          useValue: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
        },
        { provide: GoogleTagManagerService, useValue: { push: jest.fn() } },
        {
          provide: 'RestService',
          useValue: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
        },
      ],
    });
    service = TestBed.inject(AppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
