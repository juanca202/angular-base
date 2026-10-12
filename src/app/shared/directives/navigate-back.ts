import { Directive, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

/**
 * NavigateBack Directive
 *
 * This directive enables backward navigation in the browser history.
 * When applied to a button or clickable element, it automatically
 * binds a click event that attempts to navigate to the previous
 * history entry.
 *
 * If there is no previous history available (e.g., the page was
 * opened directly or refreshed), the directive falls back to navigating
 * to a specified route.
 *
 * Usage:
 * - Attach the directive to a button or clickable element.
 * - Optionally provide a fallback route using the `fallback` input.
 *
 * Example:
 * <button appNavigateBack [fallback]="'/home'">Back</button>
 *
 * Behavior:
 * - If browser history length > 1 → navigates back using Location service.
 * - If no history is available and a fallback is defined → navigates to the fallback route.
 */
@Directive({
  selector: '[appNavigateBack]',
  host: {
    '(click)': 'handleClick()'
  }
})
export class NavigateBack {
  // Dependency injection
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  // Properties
  public readonly fallback = input<string | null>(null);

  protected handleClick(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else if (this.fallback()) {
      this.router.navigate([this.fallback()!]);
    }
  }
}
