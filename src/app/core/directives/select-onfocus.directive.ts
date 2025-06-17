import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appSelectOnfocus]',
  standalone: true
})
export class SelectOnfocusDirective {
  private el = inject(ElementRef);

  @HostListener('focus') onFocus() {
    this.el.nativeElement.select();
  }
}
