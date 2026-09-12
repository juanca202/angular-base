import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from '@/shared/components/header/header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the native element', () => {
    // Act & Assert
    expect(component.nativeElement).toBe(fixture.nativeElement);
  });

  it('should not render the center content when title and subtitle are absent', () => {
    // Act
    fixture.detectChanges();
    const grow = fixture.nativeElement.querySelector('.grow');

    // Assert
    expect(grow).toBeNull();
  });

  it('should render only the title when subtitle is absent', () => {
    // Arrange
    fixture.componentRef.setInput('title', 'Page title');

    // Act
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.querySelector('.grow').textContent).toContain('Page title');
    expect(fixture.nativeElement.querySelector('.text-sm')).toBeNull();
  });

  it('should render only the subtitle when title is absent', () => {
    // Arrange
    fixture.componentRef.setInput('subtitle', 'Page subtitle');

    // Act
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.querySelector('.text-sm').textContent).toContain('Page subtitle');
  });

  it('should render both title and subtitle when both are provided', () => {
    // Arrange
    fixture.componentRef.setInput('title', 'Page title');
    fixture.componentRef.setInput('subtitle', 'Page subtitle');

    // Act
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.querySelector('.grow').textContent).toContain('Page title');
    expect(fixture.nativeElement.querySelector('.text-sm').textContent).toContain('Page subtitle');
  });
});
