import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UI_OPTIONS } from '@factor_ec/ui';

import { ErrorPlaceholder } from '@/shared/components/error-placeholder/error-placeholder';

describe('ErrorPlaceholder', () => {
  let component: ErrorPlaceholder;
  let fixture: ComponentFixture<ErrorPlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPlaceholder],
      providers: [
        {
          provide: UI_OPTIONS,
          useValue: {
            iconSettings: {
              path: 'images',
              collection: 'factoricons-regular'
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorPlaceholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
