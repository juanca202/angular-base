import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, signal } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { vi } from 'vitest';
import { MainLayout } from './main-layout';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StorageService } from '@factor_ec/utils';
import { AuthProvider } from '@/core/services/auth.provider';
import { Session } from '@/core/services/session';

const createAuthContextStub = () => ({
  settings: signal(undefined),
  getToken: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
  confirmDeleteUser: vi.fn(),
  getSettings: vi.fn(),
  loggedIn: new EventEmitter<boolean>()
});

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        Session,
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
        {
          provide: AuthProvider,
          useValue: createAuthContextStub()
        },
        {
          provide: MatBottomSheet,
          useValue: { open: vi.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
