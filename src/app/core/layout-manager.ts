import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutManager {
  setOverlapped(event: boolean, element: HTMLElement | any): void {
    const targetElement = element instanceof HTMLElement ? element : element?.nativeElement;
    if (targetElement) {
      if (!event) {
        targetElement.classList.add('ft-overlapped');
      } else {
        targetElement.classList.remove('ft-overlapped');
      }
    }
  }
}
