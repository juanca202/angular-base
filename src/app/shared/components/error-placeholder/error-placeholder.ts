import { Resource } from '@/core/utils/async-resources';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@factor_ec/ui';

@Component({
  selector: 'app-error-placeholder',
  imports: [IconComponent],
  templateUrl: './error-placeholder.html',
  styleUrl: './error-placeholder.css',
  host: {
    class: 'p-6'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPlaceholder {
  public readonly resource = input<Resource<any, any>>();
}
