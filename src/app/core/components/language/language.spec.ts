import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Language } from './language';
import { Title } from '@angular/platform-browser';
import { StorageService } from '@factor_ec/utils';
import { AppManager } from 'app/app/core/services/app-manager';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

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
        { provide: Title, useValue: { setTitle: jest.fn() } },
        { provide: StorageService, useValue: { set: jest.fn() } }
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
