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
import { Title } from '@angular/platform-browser';

import { GoogleTagManagerService } from '@factor_ec/utils';
import {
  IconComponent,
  AvatarComponent,
  ObserveIntersectingDirective,
  ProgressComponent
} from '@factor_ec/ui';
import { Language } from '@factor_ec/utils';
// import * as Sentry from '@sentry/angular';

import { AppManager } from '@/core/services/app-manager';

import { LayoutManager } from '@/core/services/layout-manager';
import { AuthProvider } from '@/core/services/auth.provider';
import { Session } from '@/core/services/session';
import { LANGUAGES } from '@/core/constants/languages';

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
    IconComponent,
    ProgressComponent,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatRippleModule,
    RouterModule,
    AvatarComponent,
    ObserveIntersectingDirective
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-page'
  }
})
export class Settings implements OnInit {
  // Dependency injection
  public readonly appManager = inject(AppManager);
  public readonly authService = inject(AuthProvider);
  private readonly googleTagManagerService = inject(GoogleTagManagerService);
  public readonly layoutManager = inject(LayoutManager);
  private readonly title = inject(Title);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly session = inject(Session);

  // Properties
  public readonly language = signal<Language>(LANGUAGES[0]);
  public readonly subscribing = signal<boolean>(false);
  public readonly supportButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('supportButton');

  constructor() {
    this.title.setTitle($localize`Settings`);
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
            this.authService.confirmDeleteUser();
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
          this.googleTagManagerService.addVariable({
            event: 'share_app_success'
          })
        )
        .catch((error) =>
          this.googleTagManagerService.addVariable({
            event: 'share_app_error',
            message: error.message
          })
        );
    }
  }
}
