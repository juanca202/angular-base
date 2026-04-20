import { Injectable, PLATFORM_ID, signal, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { loadTranslations } from '@angular/localize';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { AuthProvider, Storage } from '@factor_ec/utils';
import { MessageService } from '@factor_ec/ui';

import { versionInfo } from '@/version-info';
import { environment } from '@/environments/environment';
import { Session } from '@/core/services/session';
import { NotificationEvent, notificationEvents } from '@/core/utils/notification';
import { Language } from '@/core/models/language';

interface BeforeInstallPromptEventLike extends Event {
  readonly prompt: () => Promise<void>;
  readonly userChoice?: Promise<{ outcome?: string }>;
}

registerLocaleData(localeEn, 'en');
registerLocaleData(localeEs, 'es');

/**
 * Coordinates application-wide concerns such as localization, PWA updates,
 * push messaging, and analytics initialization.
 *
 * @remarks
 * This singleton is bootstrapped through an app initializer so that routing
 * and session restoration happen before the UI renders.
 */
@Injectable({
  providedIn: 'root'
})
export class AppManager {
  // Dependency injection
  private readonly authProvider = inject(AuthProvider);
  private readonly location = inject(Location);
  private readonly platformId = inject<object>(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly session = inject(Session);
  private readonly snackbar = inject(MatSnackBar);
  private readonly swUpdate = inject(SwUpdate);
  private readonly storage = inject(Storage);
  private readonly messageService = inject(MessageService);

  // Properties
  private installPrompt: BeforeInstallPromptEventLike | null = null;
  public readonly updateStatus = signal<string | null>('done');
  public readonly languages = signal<Language[]>(environment.languages);
  public readonly startTime = performance.now();

  // Storage keys
  private readonly clientKey = `${environment.sessionPrefix}_cid`;
  private readonly localeKey = `${environment.sessionPrefix}_loc`;

  public checkForUpdates(): void {
    if (!this.swUpdate.isEnabled) {
      this.updateStatus.set('failed');
      return;
    }
    this.updateStatus.set('checking');
    this.swUpdate.checkForUpdate();
    console.log('Check for app updates');
  }
  public getClientId(): string {
    let cid = this.storage.get(this.clientKey, 'local');
    if (!cid) {
      cid = crypto.randomUUID();
      this.storage.set(this.clientKey, cid, 'local');
    }
    return cid;
  }
  public getLocale(): string {
    return this.storage.get(this.localeKey, 'local') || 'en';
  }
  public goBack(): void {
    if (history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }
  public async init(): Promise<void> {
    // Show version in console
    console.log(`${versionInfo.npmPackage.name} ${versionInfo.git.raw}`);
    // React to updates
    this.setUpdateListeners();
    // Check for updates
    this.checkForUpdates();
    // Listen for notifications
    notificationEvents.addEventListener('notify', (event: Event) => {
      const { message, options } = (event as CustomEvent<NotificationEvent>).detail;
      this.messageService.show(message, {
        type: options?.type || 'notification'
      });
    });
    // Load the configured application language
    const locale = await this.setLocale();
    console.log('Current locale: ', locale);
    // If authenticated, initialize with local data
    if (this.authProvider.isLoggedIn()) {
      this.session.getSettings();
    }

    // Log the time taken to initialize the app
    console.log('App initialized in:', (performance.now() - this.startTime).toFixed(2), 'ms');
  }
  public install(): void {
    if (!this.installPrompt) {
      return;
    }
    this.installPrompt.prompt();
    this.installPrompt.userChoice?.then((result) => {
      if (result?.outcome !== 'dismissed') {
        //this.googleTagManager.addVariable({ event: 'install', user_id: this.settings.user?.username, app_id: this.id });
      }
    });
  }
  private async setLocale(): Promise<string> {
    const systemLocale = isPlatformBrowser(this.platformId)
      ? this.languages().find((l) => l.code === navigator.language.split('-')[0])?.code
      : null;
    const userLocale = this.languages().find(
      (l) => l.code === this.storage.get(this.localeKey, 'local')
    )?.code;
    const locale = userLocale || systemLocale || environment.defaultLocale;
    this.storage.set(this.localeKey, locale, 'local');

    // Load base translations
    try {
      const localeBaseTranslations = await import(`../../../../public/i18n/${locale}-base.js`);
      loadTranslations(localeBaseTranslations.default);
    } catch (error) {
      console.error(`Error loading base translations for ${locale}:`, error);
    }

    // Load translation file
    const localeTranslations = await import(`../../../../public/i18n/${locale}.js`);
    loadTranslations(localeTranslations.default);

    return locale;
  }
  private setUpdateListeners(): void {
    this.swUpdate.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          this.updateStatus.set('checking');
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'NO_NEW_VERSION_DETECTED':
          this.updateStatus.set('done');
          console.log('No new app version detected');
          break;
        case 'VERSION_READY': {
          this.updateStatus.set('done');
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
          const snack = this.snackbar.open($localize`Update Available`, $localize`Reload`);
          snack.onAction().subscribe(() => {
            window.location.reload();
          });
          break;
        }
        case 'VERSION_INSTALLATION_FAILED':
          this.updateStatus.set('failed');
          console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
      }
    });
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeinstallprompt', (event: Event) => {
        event.preventDefault();
        this.installPrompt = event as BeforeInstallPromptEventLike;
      });
    }
  }
}
