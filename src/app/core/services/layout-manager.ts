import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutManager {
  public getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  public setOverlapped(event: boolean, element: HTMLElement | any): void {
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
