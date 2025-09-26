import {
  Component,
  OnInit,
  TemplateRef,
  signal,
  inject,
  HostBinding,
  input,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';

import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
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

import { SubscriptionDetail } from 'app/shared/subscription-detail/subscription-detail';
import { AppManager } from 'app/core/app-manager';
import { AuthService } from 'app/core/auth.service';
import { SubscriptionService } from 'app/core/subscription.service';
import { CommonModule } from '@angular/common';
import { environment } from 'environments/environment';
import { LayoutManager } from 'app/core/layout-manager';

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
    SubscriptionDetail,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  public readonly appManager = inject(AppManager);
  public readonly authService = inject(AuthService);
  private readonly apollo = inject(Apollo);
  private readonly dialog = inject(MatDialog);
  private readonly googleTagManagerService = inject(GoogleTagManagerService);
  public readonly layoutManager = inject(LayoutManager);
  private readonly subscriptionService = inject(SubscriptionService);
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
  readonly subscriptionTemplate = viewChild.required<TemplateRef<any>>('subscriptionTemplate');
  private subscriptionDialogRef!: MatDialogRef<TemplateRef<any>>;
  public subscribing = signal<boolean>(false);
  public supportSubject!: string;
  public supportEmail: string = environment.supportEmail;

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
    const settings = await this.authService.getSettings();
    this.supportSubject = $localize`Support` + (settings ? `-${settings.user.username}` : '');
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
  openSubscription(): void {
    this.subscriptionDialogRef = this.dialog.open(this.subscriptionTemplate(), {
      panelClass: ['ft-dialog', 'ft-dialog--stacked'],
      height: '100vh',
      width: '600px',
      position: {
        left: 'auto',
        right: '0',
      },
      autoFocus: false,
    });
  }
  shareApp() {
    if (navigator.share) {
      navigator
        .share({
          title: $localize`Check out this amazing app!`,
          text: $localize`Discover this app I love. You can download it here:`,
          url: 'https://play.google.com/store/apps/details?id=ec.factor.expenses',
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
  async subscribe(): Promise<void> {
    try {
      this.subscribing.set(true);
      const response = await this.subscriptionService.pay('tplus');
      if (response) {
        this.subscriptionDialogRef.close();
      }
      this.subscribing.set(false);
    } catch (err) {
      console.log(err);
      this.subscribing.set(false);
    }
  }
}
