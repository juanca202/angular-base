import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { AutofocusDirective } from './autofocus.directive';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Inicializar el entorno de pruebas de Angular si no está inicializado
if (!getTestBed().platform) {
  getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
}

// Componente de prueba que usa la directiva
@Component({
  standalone: true,
  imports: [AutofocusDirective],
  template: '<input appAutofocus type="text" />'
})
class TestComponent {}

describe('AutofocusDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    inputElement = fixture.nativeElement.querySelector('input');
  });

  describe('ngAfterViewInit', () => {
    it('should focus the element after view init', async () => {
      // Arrange
      const focusSpy = vi.spyOn(inputElement, 'focus');

      // Act
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for setTimeout

      // Assert
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should create directive', () => {
      // Arrange & Act
      fixture.detectChanges();
      const directive = fixture.debugElement
        .query((el) => el.nativeElement === inputElement)
        ?.injector.get(AutofocusDirective);

      // Assert
      expect(directive).toBeTruthy();
    });
  });
});
