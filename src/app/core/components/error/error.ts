import { Component, HostBinding, OnInit, signal, inject, input } from '@angular/core';

import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { IconComponent } from '@factor_ec/ui';
import { Error as ErrorModel, StorageService } from '@factor_ec/utils';

import { AuthService } from 'app/auth/auth-service';
import { environment } from 'environments/environment';

/**
 * Generic error page.
 */
@Component({
  selector: 'app-error',
  imports: [IconComponent, MatButtonModule, RouterModule],
  templateUrl: './error.html',
  styleUrl: './error.scss'
})
export class Error implements OnInit {
  public readonly authService = inject(AuthService);
  private readonly storageService = inject(StorageService);
  private readonly title = inject(Title);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /**
   * Object representing the error message
   */
  error = signal<ErrorModel | undefined>(undefined);
  /**
   * Error message
   */
  message!: string;

  readonly class = input<string>('');
  @HostBinding('class') get hostClasses(): string {
    return ['ft-error', this.class()].join(' ');
  }

  async ngOnInit(): Promise<void> {
    const message = this.storageService.get(`${environment.sessionPrefix}_msg`, 'session');
    this.storageService.delete(`${environment.sessionPrefix}_msg`, 'session');
    if (this.router.currentNavigation()?.extras.state?.['message']) {
      this.message = this.router.currentNavigation()?.extras.state?.['message'];
    } else if (message) {
      this.message = message;
    }
    let code = -1;
    if (this.route.snapshot.params['code']) {
      code = Number(this.route.snapshot.params['code']);
    } else if (this.route.snapshot.data['code']) {
      code = Number(this.route.snapshot.data['code']);
    }
    switch (code) {
      case 0:
        this.error.set({
          icon: '0',
          title: $localize`Connection Error`,
          message:
            this.message ||
            $localize`Could not connect to the server. Please check your internet connection or try again later.`
        });
        break;
      case 400:
        this.error.set({
          icon: '400',
          title: $localize`Bad Request`,
          message:
            this.message ||
            $localize`The request failed, please try again or contact the administrator.`
        });
        break;
      case 403:
        this.error.set({
          icon: '403',
          title: $localize`Forbidden`,
          message: this.message || $localize`You do not have permission to access this content.`
        });
        break;
      case 404:
        this.error.set({
          icon: '404',
          title: $localize`Not Found`,
          message:
            this.message || $localize`The content you are looking for cannot be found on this site.`
        });
        break;
      case 412:
        this.error.set({
          icon: '412',
          title: $localize`Precondition Failed`,
          message:
            this.message ||
            $localize`The request could not be completed due to a failed precondition.`
        });
        break;
      case 503:
        this.error.set({
          icon: '503',
          title: $localize`Service Unavailable`,
          message:
            this.message ||
            $localize`The server is currently unable to handle the request due to a temporary overload or maintenance of the server.`
        });
        break;
      default:
        this.error.set({
          icon: 'unknown',
          title: $localize`Unknown Error`,
          message: $localize`The server cannot handle the request due to an unknown error.`
        });
        break;
    }
    this.title.setTitle(this.error()?.title ?? 'Error');
  }
  reload(): void {
    location.reload();
  }
}
