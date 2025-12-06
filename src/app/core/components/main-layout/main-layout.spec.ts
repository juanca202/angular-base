import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, signal } from '@angular/core';
import { MainLayout } from './main-layout';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StorageService } from '@factor_ec/utils';
import { AuthProvider } from '@/core/services/auth.provider';

const createAuthContextStub = () => ({
  settings: signal(undefined),
  getToken: jest.fn(),
  logout: jest.fn(),
  changePassword: jest.fn(),
  confirmDeleteUser: jest.fn(),
  getSettings: jest.fn(),
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
        {
          provide: StorageService,
          useValue: { get: jest.fn(), set: jest.fn(), delete: jest.fn() }
        },
        {
          provide: AuthProvider,
          useValue: createAuthContextStub()
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
