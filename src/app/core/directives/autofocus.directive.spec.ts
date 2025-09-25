import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AutofocusDirective } from './autofocus.directive';

@Component({
  template: `<input type="text" appAutofocus />`,
  standalone: true,
  imports: [AutofocusDirective],
})
class HostComponent {}

describe('AutofocusDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const dir = fixture.debugElement.query(By.directive(AutofocusDirective));
    expect(dir).toBeTruthy();
  });
});
