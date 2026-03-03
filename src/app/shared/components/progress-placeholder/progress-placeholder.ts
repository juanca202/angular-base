import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProgressComponent } from '@factor_ec/ui';

@Component({
  selector: 'app-progress-placeholder',
  imports: [ProgressComponent],
  templateUrl: './progress-placeholder.html',
  styleUrl: './progress-placeholder.css',
  host: {
    class: 'text-center'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressPlaceholder {
  public readonly iconClass = input<string | null>(null);
  public readonly label = input<string | null>(null);
}
