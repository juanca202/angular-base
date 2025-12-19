import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { vi } from 'vitest';
import { Error } from './error';
import { AppManager } from '@/core/services/app-manager';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthProvider } from '@/core/services/auth.provider';
import { StorageService, GoogleTagManagerService } from '@factor_ec/utils';
import { MatDialog } from '@angular/material/dialog';

const createAuthContextStub = () => ({
  settings: signal(undefined),
  getToken: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
  confirmDeleteUser: vi.fn(),
  getSettings: vi.fn(),
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

describe('Error', () => {
  let component: Error;
  let fixture: ComponentFixture<Error>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Error],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AppManager,
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
            currentNavigation: vi.fn(() => ({ extras: { state: {} } }))
          }
        },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {}, data: {} } } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: Location, useValue: { back: vi.fn(), forward: vi.fn(), go: vi.fn() } },
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
          useValue: {
            get: vi.fn(),
            set: vi.fn(),
            delete: vi.fn(),
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn()
          }
        },
        { provide: GoogleTagManagerService, useValue: { push: vi.fn() } },
        { provide: AuthProvider, useValue: createAuthContextStub() },
        { provide: Title, useValue: { setTitle: vi.fn(), getTitle: vi.fn(() => 'Test') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Error);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
