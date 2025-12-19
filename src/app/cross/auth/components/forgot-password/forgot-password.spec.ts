import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { ForgotPassword } from './forgot-password';
import { MessageService } from '@factor_ec/ui';
import { GoogleTagManagerService } from '@factor_ec/utils';

describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MessageService, useValue: { show: vi.fn() } },
        { provide: GoogleTagManagerService, useValue: { push: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
