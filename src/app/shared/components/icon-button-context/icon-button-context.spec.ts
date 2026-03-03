import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconButtonContext } from './icon-button-context';

describe('IconButtonContext', () => {
  let component: IconButtonContext;
  let fixture: ComponentFixture<IconButtonContext>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButtonContext]
    }).compileComponents();

    fixture = TestBed.createComponent(IconButtonContext);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
