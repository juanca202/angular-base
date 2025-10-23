import {
  Component,
  OnInit,
  signal,
  inject,
  HostBinding,
  input,
  ElementRef,
  viewChild,
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
  ProgressComponent,
} from '@factor_ec/ui';
import { Language } from '@factor_ec/utils';
import { lastValueFrom } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';
import * as Sentry from '@sentry/angular';

import { AppManager } from 'app/core/services/app-manager';
import { AuthService } from 'app/auth/auth-service';
import { CommonModule } from '@angular/common';
import { LayoutManager } from 'app/core/services/layout-manager';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    IconComponent,
    ProgressComponent,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatRippleModule,
    RouterModule,
    AvatarComponent,
    ObserveIntersectingDirective,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  public readonly appManager = inject(AppManager);
  public readonly authService = inject(AuthService);
  private readonly apollo = inject(Apollo);
  private readonly googleTagManagerService = inject(GoogleTagManagerService);
  public readonly layoutManager = inject(LayoutManager);
  private readonly title = inject(Title);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public notificationsCount = signal<number>(0);
  public spaces = signal<number>(0);
  public categories = signal<number>(0);
  public tags = signal<number>(0);
  public language = signal<Language>({
    code: 'en',
    name: 'English',
  });
  public subscribing = signal<boolean>(false);
  public readonly supportButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('supportButton');

  readonly class = input<string>('');
  @HostBinding('class') get hostClasses(): string {
    return ['ft-page', 'ft-page--fullscreen', this.class()].join(' ');
  }

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

  async ngOnInit(): Promise<void> {
    this.getNotifications();
    this.route.paramMap.subscribe(async (paramMap: ParamMap) => {
      const action = paramMap.get('action');
      if (action) {
        switch (paramMap.get('action')) {
          case 'delete-data':
            this.authService.confirmDeleteUser();
            break;
          default:
            this.router.navigateByUrl('error/404', {
              skipLocationChange: true,
            });
            break;
        }
      }
    });
    const feedback = Sentry.getFeedback();
    feedback?.attachTo(this.supportButton()?.nativeElement);
  }
  async getNotifications(): Promise<void> {
    const query = await lastValueFrom(
      this.apollo.query<any>({
        query: gql`
          query {
            notifications(seen: false) {
              totalCount
            }
          }
        `,
        fetchPolicy: 'network-only',
      }),
    );
    this.notificationsCount.set(query.data.notifications.totalCount);
  }
  shareApp() {
    if (navigator.share) {
      navigator
        .share({
          title: $localize`Check out this amazing app!`,
          text: $localize`Discover this app I love. You can download it here:`,
          url: '',
        })
        .then(() =>
          this.googleTagManagerService.addVariable({
            event: 'share_app_success',
          }),
        )
        .catch((error) =>
          this.googleTagManagerService.addVariable({
            event: 'share_app_error',
            message: error.message,
          }),
        );
    }
  }
}
