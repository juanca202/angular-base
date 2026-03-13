import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Icon } from '@factor_ec/ui';
import { Action } from '@/shared/models/action';

@Component({
  selector: 'app-icon-button-context',
  imports: [MatMenuModule, MatButtonModule, Icon],
  templateUrl: './icon-button-context.html',
  styleUrl: './icon-button-context.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonContext {
  public readonly items = input<Action[]>([]);
}
