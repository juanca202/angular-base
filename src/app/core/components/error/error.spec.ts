import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter, signal } from '@angular/core';
import { Error } from './error';
import { AppManager } from '@/core/services/app-manager';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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
        { provide: AuthProvider, useValue: createAuthContextStub() }
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
