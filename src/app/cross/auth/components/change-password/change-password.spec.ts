import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { ChangePassword } from './change-password';
import { AppManager } from '@/core/services/app-manager';
import { MessageService } from '@factor_ec/ui';
import { StorageService, GoogleTagManagerService } from '@factor_ec/utils';
import { AuthProvider } from '@/core/services/auth.provider';
import { SwUpdate } from '@angular/service-worker';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
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

describe('ChangePassword', () => {
  let component: ChangePassword;
  let fixture: ComponentFixture<ChangePassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePassword],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AppManager,
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
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

    fixture = TestBed.createComponent(ChangePassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
