import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appSelectOnfocus]',
  host: {
    '(focus)': 'onFocus()'
  }
})
export class SelectOnfocusDirective {
  private readonly el = inject(ElementRef);

  public onFocus(): void {
    this.el.nativeElement.select();
  }
}
