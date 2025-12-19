import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { vi } from 'vitest';
import { DeleteUser } from './delete-user';
import { AppManager } from '@/core/services/app-manager';
import { AuthService } from '@/cross/auth/auth-service';
import { MessageService } from '@factor_ec/ui';
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

describe('DeleteUser', () => {
  let component: DeleteUser;
  let fixture: ComponentFixture<DeleteUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteUser],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AppManager,
        AuthService,
        Session,
        { provide: Router, useValue: { navigate: vi.fn() } },
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
        { provide: MessageService, useValue: { show: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
