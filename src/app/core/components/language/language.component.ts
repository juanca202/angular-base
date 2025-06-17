import {
  Component,
  WritableSignal,
  signal,
  inject,
  HostBinding,
  input
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { IconComponent } from '@factor_ec/ui';
import { Language, StorageService } from '@factor_ec/utils';

import { AppService } from 'app/core/app.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-language',
  imports: [
    IconComponent,
    MatButtonModule,
    MatTooltipModule,
    MatRippleModule,
    RouterModule
  ],
  templateUrl: './language.component.html',
  styleUrl: './language.component.scss',
  standalone: true
})
export class LanguageComponent {
  appService = inject(AppService);
  private storageService = inject(StorageService);
  private title = inject(Title);
  locale: WritableSignal<string | undefined> = signal(
    this.appService.getLocale()
  );

  readonly class = input<string>('');
  @HostBinding('class') get hostClasses(): string {
    return ['ft-page', 'ft-page--fullscreen', this.class()].join(' ');
  }

  constructor() {
    this.title.setTitle($localize`Language`);
  }

  async select(language: Language): Promise<void> {
    this.storageService.set(
      `${environment.sessionPrefix}_loc`,
      language.code,
      'local'
    );
    location.reload();
  }
}
