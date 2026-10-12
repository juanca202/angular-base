import { Component, input } from '@angular/core';
import { Progress } from '@factor_ec/ui';

@Component({
  selector: 'app-progress-placeholder',
  imports: [Progress],
  templateUrl: './progress-placeholder.html',
  styleUrl: './progress-placeholder.css',
  host: {
    class: 'text-center'
  }
})
export class ProgressPlaceholder {
  public readonly iconClass = input<string | null>(null);
  public readonly label = input<string | null>(null);
}
