import { TestBed } from '@angular/core/testing';
import { MsalService } from '@azure/msal-angular';
import { vi } from 'vitest';

import { AuthService } from './auth-service';

const mockMsalService = {
  loginRedirect: vi.fn(),
  logoutRedirect: vi.fn(),
  instance: {
    getActiveAccount: vi.fn().mockReturnValue(null)
  }
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MsalService, useValue: mockMsalService }]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
