import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { AppManager } from 'app/core/app-manager';
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

describe('AppManager', () => {
  let service: AppManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AppManager,
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
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
          },
        },
        { provide: GoogleTagManagerService, useValue: { push: jest.fn() } },
      ],
    });
    service = TestBed.inject(AppManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
