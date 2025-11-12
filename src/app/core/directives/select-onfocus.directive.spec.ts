import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectOnfocusDirective } from './select-onfocus.directive';

@Component({
  template: `<input type="text" appSelectOnfocus />`,
  imports: [SelectOnfocusDirective],
})
class HostComponent {}

describe('SelectOnfocusDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const dir = fixture.debugElement.query(By.directive(SelectOnfocusDirective));
    expect(dir).toBeTruthy();
  });
});
