import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SelectOnfocusDirective } from './select-onfocus.directive';

// Componente de prueba que usa la directiva
@Component({
  imports: [SelectOnfocusDirective],
  template: '<input appSelectOnfocus type="text" value="test value" />'
})
class TestComponent {}

describe('SelectOnfocusDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    inputElement = fixture.nativeElement.querySelector('input');
  });

  describe('onFocus', () => {
    it('should select text when input receives focus', () => {
      // Arrange
      const selectSpy = vi.spyOn(inputElement, 'select');

      // Act
      inputElement.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      // Assert
      expect(selectSpy).toHaveBeenCalled();
    });

    it('should create directive', () => {
      // Arrange & Act
      fixture.detectChanges();
      const directive = fixture.debugElement
        .query((el) => el.nativeElement === inputElement)
        ?.injector.get(SelectOnfocusDirective);

      // Assert
      expect(directive).toBeTruthy();
    });
  });
});
