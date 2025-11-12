import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appSelectOnfocus]',
  host: {
    '(focus)': 'onFocus()'
  }
})
export class SelectOnfocusDirective {
  private el = inject(ElementRef);

  onFocus(): void {
    this.el.nativeElement.select();
  }
}
