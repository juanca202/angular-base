import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NavigateBack } from './navigate-back';

// Componente de prueba que usa la directiva
@Component({
  imports: [NavigateBack],
  template: '<button appNavigateBack [fallback]="fallbackRoute">Back</button>'
})
class TestComponent {
  public fallbackRoute: string | null = null;
}

describe('NavigateBack', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let buttonElement: HTMLButtonElement;
  let location: Location;
  let router: Router;
  let locationBackSpy: ReturnType<typeof vi.spyOn>;
  let routerNavigateSpy: ReturnType<typeof vi.spyOn>;

  // Helper para mockear history.length
  const mockHistoryLength = (length: number) => {
    Object.defineProperty(window, 'history', {
      value: { ...history, length },
      writable: true,
      configurable: true
    });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    buttonElement = fixture.nativeElement.querySelector('button');
    location = TestBed.inject(Location);
    router = TestBed.inject(Router);

    locationBackSpy = vi.spyOn(location, 'back');
    routerNavigateSpy = vi.spyOn(router, 'navigate');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('handleClick', () => {
    it('should navigate back when history length is greater than 1', () => {
      // Arrange
      mockHistoryLength(3);
      fixture.detectChanges();

      // Act
      buttonElement.click();

      // Assert
      expect(locationBackSpy).toHaveBeenCalledTimes(1);
      expect(routerNavigateSpy).not.toHaveBeenCalled();
    });

    it('should navigate to fallback route when history length is 1 and fallback is provided', () => {
      // Arrange
      mockHistoryLength(1);
      component.fallbackRoute = '/home';
      fixture.detectChanges();

      // Act
      buttonElement.click();

      // Assert
      expect(locationBackSpy).not.toHaveBeenCalled();
      expect(routerNavigateSpy).toHaveBeenCalledTimes(1);
      expect(routerNavigateSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should not navigate when history length is 1 and no fallback is provided', () => {
      // Arrange
      mockHistoryLength(1);
      component.fallbackRoute = null;
      fixture.detectChanges();

      // Act
      buttonElement.click();

      // Assert
      expect(locationBackSpy).not.toHaveBeenCalled();
      expect(routerNavigateSpy).not.toHaveBeenCalled();
    });

    it('should navigate to fallback route when history length is 0 and fallback is provided', () => {
      // Arrange
      mockHistoryLength(0);
      component.fallbackRoute = '/dashboard';
      fixture.detectChanges();

      // Act
      buttonElement.click();

      // Assert
      expect(locationBackSpy).not.toHaveBeenCalled();
      expect(routerNavigateSpy).toHaveBeenCalledTimes(1);
      expect(routerNavigateSpy).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should prioritize history back over fallback when history length is greater than 1', () => {
      // Arrange
      mockHistoryLength(2);
      component.fallbackRoute = '/home';
      fixture.detectChanges();

      // Act
      buttonElement.click();

      // Assert
      expect(locationBackSpy).toHaveBeenCalledTimes(1);
      expect(routerNavigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('directive creation', () => {
    it('should create directive instance', () => {
      // Arrange & Act
      fixture.detectChanges();
      const directive = fixture.debugElement
        .query((el) => el.nativeElement === buttonElement)
        ?.injector.get(NavigateBack);

      // Assert
      expect(directive).toBeTruthy();
    });
  });
});
