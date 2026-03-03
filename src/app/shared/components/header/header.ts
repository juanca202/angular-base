import { ChangeDetectionStrategy, Component, ElementRef, inject, input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: {
    class: 'flex items-center min-h-14 p-2 text-2xl font-bold text-center'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  // Dependency injection
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  // Properties
  public get nativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }
  public readonly title = input<string | null>(null);
  public readonly subtitle = input<string | null>(null);
}
