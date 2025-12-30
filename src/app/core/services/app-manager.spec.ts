import { TestBed } from '@angular/core/testing';
import { EventEmitter, signal, PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { vi } from 'vitest';
import { AppManager } from '@/core/services/app-manager';
import { StorageService, GoogleTagManagerService } from '@factor_ec/utils';
import { AuthProvider } from '@/core/services/auth.provider';
import { Session } from '@/core/services/session';

const createAuthContextStub = () => ({
  settings: signal(undefined),
  getToken: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
  confirmDeleteUser: vi.fn(),
  getSettings: vi.fn().mockResolvedValue(false),
  loggedIn: new EventEmitter<boolean>()
});

vi.mock('version-info', () => ({
  versionInfo: {
    version: 'test',
    hash: 'abc',
    git: {
      raw: 'test-version'
    }
  }
}));

describe('AppManager', () => {
  let service: AppManager;
  let mockStorageService: StorageService;
  let mockGoogleTagManagerService: GoogleTagManagerService;

  beforeEach(() => {
    mockStorageService = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    } as unknown as StorageService;

    mockGoogleTagManagerService = {
      push: vi.fn(),
      addVariable: vi.fn(),
      appendTrackingCode: vi.fn()
    } as unknown as GoogleTagManagerService;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AppManager,
        Session,
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: Location, useValue: { back: vi.fn(), forward: vi.fn(), go: vi.fn() } },
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: SwUpdate,
          useValue: {
            available: { subscribe: vi.fn() },
            activated: { subscribe: vi.fn() },
            versionUpdates: { subscribe: vi.fn() }
          }
        },
        {
          provide: StorageService,
          useValue: mockStorageService
        },
        {
          provide: GoogleTagManagerService,
          useValue: mockGoogleTagManagerService
        },
        { provide: AuthProvider, useValue: createAuthContextStub() }
      ]
    });

    service = TestBed.inject(AppManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
