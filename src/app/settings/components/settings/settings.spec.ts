import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from './settings';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StorageService } from '@factor_ec/utils';
import { GoogleTagManagerService } from '@factor_ec/utils';

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
