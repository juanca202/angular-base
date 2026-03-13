import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { Icon } from '@factor_ec/ui';
import { Language as LanguageModel } from '@/core/models/environment';
import { Storage } from '@factor_ec/utils';

import { AppManager } from '@/core/services/app-manager';
import { environment } from '@/environments/environment';

/**
 * Lets the user review and change the active locale for the application.
 */
@Component({
  selector: 'app-language',
  imports: [Icon, MatButtonModule, MatTooltipModule, MatRippleModule, RouterModule],
  templateUrl: './language.html',
  styleUrl: './language.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-page'
  }
})
export class Language {
  // Dependency injection
  public readonly appManager = inject(AppManager);
  private readonly storage = inject(Storage);

  // Properties
  public readonly locale = signal<string | undefined>(this.appManager.getLocale());

  public async select(language: LanguageModel): Promise<void> {
    this.storage.set(`${environment.sessionPrefix}_loc`, language.code, 'local');
    location.reload();
  }
}
