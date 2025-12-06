import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, signal } from '@angular/core';
import { Settings } from './settings';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StorageService } from '@factor_ec/utils';
import { GoogleTagManagerService } from '@factor_ec/utils';
import { AuthProvider } from 'app/core/services/auth.provider';

const createAuthContextStub = () => ({
  settings: signal(undefined),
  getToken: jest.fn(),
  logout: jest.fn(),
  changePassword: jest.fn(),
  confirmDeleteUser: jest.fn(),
  getSettings: jest.fn(),
  loggedIn: new EventEmitter<boolean>()
});

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: StorageService,
          useValue: { get: jest.fn(), set: jest.fn(), delete: jest.fn() }
        },
        {
          provide: GoogleTagManagerService,
          useValue: { addVariable: jest.fn(), appendTrackingCode: jest.fn() }
        },
        {
          provide: AuthProvider,
          useValue: createAuthContextStub()
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
