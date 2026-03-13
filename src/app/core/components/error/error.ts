import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Icon } from '@factor_ec/ui';
import { Error as ErrorModel, Storage } from '@factor_ec/utils';

import { AuthProvider } from '@factor_ec/utils';
import { environment } from '@/environments/environment';

/**
 * Generic error page used for unmatched routes and server-side failures.
 *
 * @remarks
 * The component reads contextual information from navigation state or storage
 * and displays the corresponding localized message and recovery action.
 */
@Component({
  selector: 'app-error',
  imports: [Icon, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './error.html',
  styleUrl: './error.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-error'
  }
})
export class Error implements OnInit {
  // Dependency injection
  public readonly authProvider = inject(AuthProvider);
  private readonly storage = inject(Storage);
  private readonly title = inject(Title);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Properties
  public readonly error = signal<ErrorModel | undefined>(undefined);
  public message!: string;

  ngOnInit(): void {
    this.setError();
    this.title.setTitle(this.error()?.title ?? $localize`Error`);
  }
  public reload(): void {
    location.reload();
  }
  private setError(): void {
    const message = this.storage.get(`${environment.sessionPrefix}_msg`, 'session');
    this.storage.delete(`${environment.sessionPrefix}_msg`, 'session');
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
  }
}
