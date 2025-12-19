import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';
import { Auth } from './auth';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StorageService, GoogleTagManagerService } from '@factor_ec/utils';
import { MessageService } from '@factor_ec/ui';
import { AppManager } from '@/core/services/app-manager';
import { AuthService } from '@/cross/auth/auth-service';
import { AuthProvider } from '@/core/services/auth.provider';
import { SwUpdate } from '@angular/service-worker';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

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

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AppManager,
        AuthService,
        { provide: Router, useValue: { navigate: vi.fn(), navigateByUrl: vi.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } },
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
        { provide: GoogleTagManagerService, useValue: { push: vi.fn(), addVariable: vi.fn() } },
        { provide: AuthProvider, useValue: createAuthContextStub() },
        { provide: MessageService, useValue: { show: vi.fn() } },
        { provide: Title, useValue: { setTitle: vi.fn(), getTitle: vi.fn(() => 'Test') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
