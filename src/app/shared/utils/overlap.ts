/**
 * Toggles the `ft-overlapped` CSS class on an element (or an `ElementRef`-like wrapper),
 * used to dim/mark elements sitting behind an overlay.
 *
 * @param overlapped - `false` adds the class (overlapped state), `true` removes it.
 * @param element - Target element, an `{ nativeElement }` wrapper, or `null`/`undefined` (no-op).
 */
export function setOverlapped(
  overlapped: boolean,
  element: HTMLElement | { nativeElement?: HTMLElement } | null | undefined
): void {
  const targetElement = element instanceof HTMLElement ? element : element?.nativeElement;
  if (!targetElement) {
    return;
  }
  if (overlapped) {
    targetElement.classList.remove('ft-overlapped');
  } else {
    targetElement.classList.add('ft-overlapped');
  }
}
