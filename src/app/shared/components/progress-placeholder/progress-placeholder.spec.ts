import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressPlaceholder } from './progress-placeholder';

describe('ProgressPlaceholder', () => {
  let component: ProgressPlaceholder;
  let fixture: ComponentFixture<ProgressPlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressPlaceholder]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressPlaceholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
