import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements AfterViewInit {
  private el = inject(ElementRef);

  ngAfterViewInit(): void {
    // Espera un ciclo de eventos para garantizar que el elemento esté listo
    setTimeout(() => {
      this.el.nativeElement.focus();
    });
  }
}
