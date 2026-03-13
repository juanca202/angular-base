import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  inject,
  ElementRef,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

import { GoogleTagManager } from '@factor_ec/utils';
import { Icon, Avatar, Progress } from '@factor_ec/ui';
import { Language } from '@/core/models/environment';

import { AppManager } from '@/core/services/app-manager';

import { LayoutManager } from '@/core/services/layout-manager';
import { AuthProvider } from '@factor_ec/utils';
import { Session } from '@/core/services/session';
import { environment } from '@/environments/environment';
import { versionInfo } from '@/version-info';
import { AuthManager } from '../../managers/auth-manager';

/**
 * Renders the settings hub, exposing contextual actions such as sharing,
 * password management, and locale switching.
 *
 * @remarks
 * The component consumes signals from {@link AppManager} and {@link Session}
 * to present personalized data and system status.
 */
@Component({
  selector: 'app-settings',
  imports: [
    Icon,
    Progress,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatRippleModule,
    RouterModule,
    Avatar
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-page'
  }
})
export class Settings implements OnInit {
  // Dependency injection
  public readonly appManager = inject(AppManager);
  public readonly authManager = inject(AuthManager);
  public readonly authProvider = inject(AuthProvider);
  private readonly googleTagManager = inject(GoogleTagManager);
  public readonly layoutManager = inject(LayoutManager);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly session = inject(Session);

  // Properties
  public readonly appName = environment.appName;
  public readonly appVersion = versionInfo.git.raw;
  public readonly language = signal<Language>(environment.languages[0]);
  public readonly subscribing = signal<boolean>(false);
  public readonly supportButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('supportButton');

  constructor() {
    this.appManager.checkForUpdates();
    const currentLanguage = this.appManager
      .languages()
      .find((l) => l.code === this.appManager.getLocale());
    if (currentLanguage) {
      this.language.set(currentLanguage);
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (paramMap: ParamMap) => {
      const action = paramMap.get('action');
      if (action) {
        switch (paramMap.get('action')) {
          case 'delete-data':
            this.authManager.confirmDeleteUser();
            break;
          default:
            this.router.navigateByUrl('error/404', {
              skipLocationChange: true
            });
            break;
        }
      }
    });
    /*
    const feedback = Sentry.getFeedback();
    feedback?.attachTo(this.supportButton()?.nativeElement);
    */
  }
  public shareApp(): void {
    if (navigator.share) {
      navigator
        .share({
          title: $localize`Check out this amazing app!`,
          text: $localize`Discover this app I love. You can download it here:`,
          url: ''
        })
        .then(() =>
          this.googleTagManager.addVariable({
            event: 'share_app_success'
          })
        )
        .catch((error) =>
          this.googleTagManager.addVariable({
            event: 'share_app_error',
            message: error.message
          })
        );
    }
  }
}
