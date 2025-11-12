import { Component, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { IconComponent } from '@factor_ec/ui';
import { Language as LanguageModel, StorageService } from '@factor_ec/utils';

import { AppManager } from 'app/core/services/app-manager';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-language',
  imports: [IconComponent, MatButtonModule, MatTooltipModule, MatRippleModule, RouterModule],
  templateUrl: './language.html',
  styleUrl: './language.scss',
  host: {
    class: 'ft-page ft-page--fullscreen',
  },
})
export class Language {
  public readonly appManager = inject(AppManager);
  private readonly storageService = inject(StorageService);
  private readonly title = inject(Title);

  public locale = signal<string | undefined>(this.appManager.getLocale());
  constructor() {
    this.title.setTitle($localize`Language`);
  }

  async select(language: LanguageModel): Promise<void> {
    this.storageService.set(`${environment.sessionPrefix}_loc`, language.code, 'local');
    location.reload();
  }
}
