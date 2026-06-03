import { ChangeDetectionStrategy, Component, input, Signal } from '@angular/core';
import { Icon } from '@factor_ec/ui';

export interface ErrorResource {
  readonly error: Signal<unknown | null>;
  readonly reload: () => Promise<unknown>;
}

@Component({
  selector: 'app-error-placeholder',
  imports: [Icon],
  templateUrl: './error-placeholder.html',
  styleUrl: './error-placeholder.css',
  host: {
    class: 'p-6'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPlaceholder {
  public readonly resource = input<ErrorResource>();
}
