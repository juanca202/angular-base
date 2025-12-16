import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, signal } from '@angular/core';
import { Language } from './language';
import { Title } from '@angular/platform-browser';
import { StorageService, GoogleTagManagerService } from '@factor_ec/utils';
import { AppManager } from '@/core/services/app-manager';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { vi } from 'vitest';
import { AuthProvider } from '@/core/services/auth.provider';

/**
 *
 */
describe('Language', () => {
  let component: Language;
  let fixture: ComponentFixture<Language>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Language],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AppManager,
        { provide: Title, useValue: { setTitle: vi.fn() } },
        { provide: StorageService, useValue: { set: vi.fn(), get: vi.fn(), delete: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
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
        { provide: GoogleTagManagerService, useValue: { push: vi.fn() } },
        {
          provide: AuthProvider,
          useValue: {
            settings: signal(undefined),
            getToken: vi.fn(),
            logout: vi.fn(),
            changePassword: vi.fn(),
            confirmDeleteUser: vi.fn(),
            getSettings: vi.fn().mockResolvedValue(false),
            loggedIn: new EventEmitter<boolean>()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Language);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
