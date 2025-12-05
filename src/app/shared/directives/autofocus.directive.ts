import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ftAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {
  private readonly el = inject(ElementRef);

  ngAfterViewInit(): void {
    // Wait one event loop tick to ensure the element is ready
    setTimeout(() => {
      this.el.nativeElement.focus();
    });
  }
}
