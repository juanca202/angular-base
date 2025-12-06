import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from './auth';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StorageService } from '@factor_ec/utils';

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: StorageService,
          useValue: { get: jest.fn(), set: jest.fn(), delete: jest.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
